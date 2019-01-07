import { mpls } from "./mpls"
import ExtensibleCustomError from "extensible-custom-error"
import { SimpleBufferReader } from "@yagisumi/simple-buffer-reader"

const CodingTypeMap: { [type: number]: string } = {
  0x01: "MPEG-1 Video",
  0x02: "MPEG-2 Video",
  0x03: "MPEG-1 Audio",
  0x04: "MPEG-2 Audio",
  0x80: "LPCM",
  0x81: "AC-3",
  0x82: "DTS",
  0x83: "TrueHD",
  0x84: "AC-3 Plus",
  0x85: "DTS-HD",
  0x86: "DTS-HD Master",
  0xea: "VC-1",
  0x1b: "H.264",
  0x90: "Presentation Graphics",
  0x91: "Interactive Graphics",
  0x92: "Text Subtitle",
}

const VideoFormatMap: { [type: number]: string } = {
  1: "480i",
  2: "576i",
  3: "480p",
  4: "1080i",
  5: "720p",
  6: "1080p",
  7: "576p",
}

const VideoRateMap: { [type: number]: string } = {
  1: "23.976",
  2: "24",
  3: "25",
  4: "29.97",
  6: "50",
  7: "59.94",
}

const AudioFormatMap: { [type: number]: string } = {
  1: "Mono",
  3: "Stereo",
  6: "Multi Channel",
  12: "Combo",
}

const AudioRateMap: { [type: number]: string } = {
  1: "48 Khz",
  4: "96 Khz",
  5: "192 Khz",
  12: "48/192 Khz",
  14: "48/96 Khz",
}

class MplsError extends ExtensibleCustomError {}

/**
 *
 * @param buf
 * @ignore
 */
export function mplsImpl(buf: ArrayBuffer) {
  const r = new SimpleBufferReader(buf, false)

  try {
    const mpls: mpls.MPLS = {
      _size_of_file: buf.byteLength,
      type_indicator: r.readString(4),
      type_indicator2: r.readString(4),
      playlist_start_address: r.readUint32BE(),
      playlist_mark_start_address: r.readUint32BE(),
      extension_data_start_address: r.readUint32BE(),
      app_info_play_list: parse_app_info_play_list(r.skip(20)),
      playlist: { length: 0, number_of_playitems: 0, number_of_subpaths: 0, playitems: [], subpaths: [] },
      playlist_mark: { length: 0, number_marks: 0, entries: [] },
    }

    if (mpls.type_indicator !== "MPLS") {
      throw new MplsError(`type_indecator should be 'MPLS' but '${mpls.type_indicator}'`)
    }

    mpls.playlist = parse_playlist(r.seek(mpls.playlist_start_address))
    mpls.playlist_mark = parse_playlist_mark(r.seek(mpls.playlist_mark_start_address))

    set_abs_start(mpls)

    return mpls
  } catch (err) {
    throw new MplsError("parse error", err)
  }
}

/**
 *
 * @param r
 * @ignore
 */
export function parse_app_info_play_list(r: SimpleBufferReader): mpls.AppInfoPlayList {
  try {
    const miscellaneous_flags = r.peekUint8(0x38)
    const app_info: mpls.AppInfoPlayList = {
      length: r.readUint32BE(),
      playlist_playback_type: r.readUint8(),
      playlist_random_access_flag: (miscellaneous_flags & 0b10000000) !== 0,
      audio_mix_app_flag: (miscellaneous_flags & 0b01000000) !== 0,
      lossless_may_bypass_mixer_flag: (miscellaneous_flags & 0b00100000) !== 0,
      UO_mask_table: r.readBuffer(8),
    }

    return app_info
  } catch (err) {
    throw new MplsError("parse error", err)
  }
}

/**
 *
 * @param r
 * @ignore
 */
export function parse_playlist(r: SimpleBufferReader): mpls.PlayList {
  try {
    const playlist: mpls.PlayList = {
      length: r.readUint32BE(),
      number_of_playitems: r.skip(2).readUint16BE(),
      number_of_subpaths: r.readUint16BE(),
      playitems: [],
      subpaths: [],
    }

    for (let i = 0; i < playlist.number_of_playitems; i++) {
      const pos = r.getPos()
      const flag = r.peekUint8(r.getPos() + 12)
      const item: mpls.PlayItem = {
        length: r.readUint16BE(),
        clip_file: r.readString(5),
        codec_id: r.readString(4),
        is_multi_angle: (flag & 0b10000) != 0,
        connection_condition: flag & 0b111,
        stc_id: r.skip(2).readUint8(),
        in_time: r.readUint32BE(),
        out_time: r.readUint32BE(),
        UO_mask_table: r.readBuffer(8),
        random_access_flag: (r.readUint8() & 0b10000000) !== 0,
        still_mode: r.readUint8(),
      }

      r.skip(2) // still_time
      if (item.is_multi_angle) {
        const num_angles = r.readUint8()
        r.skip(1)
        r.skip(num_angles * 10)
      }

      item.stn = parse_playlist_stn(r)

      playlist.playitems.push(item)
      r.seek(pos + 2 + item.length)
    }

    for (let i = 0; i < playlist.number_of_subpaths; i++) {
      const pos = r.getPos()
      const subpath = {
        length: r.readUint32BE(),
        type: r.skip(1).readUint8(),
      }
      r.seek(pos + 4 + subpath.length)
    }

    return playlist
  } catch (err) {
    throw new MplsError("parse error", err)
  }
}

/**
 *
 * @param r
 * @ignore
 */
export function parse_playlist_stn(r: SimpleBufferReader): mpls.PlaylistSTN {
  try {
    const pos = r.getPos()
    const stn: mpls.PlaylistSTN = {
      length: r.readUint16BE(),
      num_primary_video: r.skip(2).readUint8(),
      num_primary_audio: r.readUint8(),
      num_pg: r.readUint8(),
      num_ig: r.readUint8(),
      num_secondary_audio: r.readUint8(),
      num_secondary_video: r.readUint8(),
      num_PIP_PG: r.readUint8(),
      streams: [],
    }

    r.skip(5)
    for (let i = 0; i < stn.num_primary_video; i++) {
      stn.streams.push(parse_stream(r))
    }
    for (let i = 0; i < stn.num_primary_audio; i++) {
      stn.streams.push(parse_stream(r))
    }
    for (let i = 0; i < stn.num_pg; i++) {
      stn.streams.push(parse_stream(r))
    }
    for (let i = 0; i < stn.num_ig; i++) {
      stn.streams.push(parse_stream(r))
    }

    r.seek(pos + stn.length + 2)

    return stn
  } catch (err) {
    throw new MplsError("parse error")
  }
}

/**
 *
 * @param r
 * @ignore
 */
export function parse_stream(r: SimpleBufferReader): mpls.Stream {
  const pos = r.getPos()
  try {
    const stream: mpls.Stream = {
      length: r.readUint8(),
      stream_type: r.readUint8(),
      attributes: { length: 0, coding_type: 0 },
    }

    switch (stream.stream_type) {
      case 1:
        stream.pid = r.readUint16BE()
        break
      case 2:
      case 4:
        stream.subpath_id = r.readUint8()
        stream.subclip_id = r.readUint8()
        stream.pid = r.readUint16BE()
        break
      case 3:
        stream.subpath_id = r.readUint8()
        stream.pid = r.readUint16BE()
        break
      default:
        break
    }

    r.seek(pos + stream.length + 1)

    const attr_pos = r.getPos()
    const attr: mpls.StreamAttributes = {
      length: r.readUint8(),
      coding_type: r.readUint8(),
    }

    attr._coding_type = CodingTypeMap[attr.coding_type]

    const info = r.peekUint8()
    switch (attr.coding_type) {
      case 0x01:
      case 0x02:
      case 0xea:
      case 0x1b:
        r.skip(1)
        attr.format = (info >> 4) & 0b1111
        attr.rate = info & 0b1111
        attr._format = VideoFormatMap[attr.format]
        attr._rate = VideoRateMap[attr.rate]
        break
      case 0x03:
      case 0x04:
      case 0x80:
      case 0x81:
      case 0x82:
      case 0x83:
      case 0x84:
      case 0x85:
      case 0x86:
        r.skip(1)
        attr.format = (info >> 4) & 0b1111
        attr.rate = info & 0b1111
        attr._format = AudioFormatMap[attr.format]
        attr._rate = AudioRateMap[attr.rate]
        attr.lang_code = r.readString(3)
        break
      case 0x90:
      case 0x91:
        attr.lang_code = r.readString(3)
        break
      case 0x92:
        attr.char_code = r.readUint8()
        attr.lang_code = r.readString(3)
        break
      default:
        break
    }

    r.seek(attr_pos + attr.length + 1)

    stream.attributes = attr

    return stream
  } catch (err) {
    throw new MplsError("parse error")
  }
}

/**
 *
 * @param r
 * @ignore
 */
export function parse_playlist_mark(r: SimpleBufferReader): mpls.PlayListMark {
  try {
    const playlist_mark: mpls.PlayListMark = {
      length: r.readUint32BE(),
      number_marks: r.readUint16BE(),
      entries: [],
    }

    const count = (playlist_mark.length - 2) / 14
    const rest = (playlist_mark.length - 2) % 14

    if (rest !== 0) {
      throw new MplsError("unexpected length of PlayListMark (length: playlist_mark.length)")
    }

    for (let i = 0; i < count; i++) {
      playlist_mark.entries.push({
        mark_type: r.skip(1).readUint8(),
        play_item_ref: r.readUint16BE(),
        time: r.readUint32BE(),
        entry_es_pid: r.readUint16BE(),
        duration: r.readUint32BE(),
      })
    }

    return playlist_mark
  } catch (err) {
    throw new MplsError("parse error", err)
  }
}

/**
 *
 * @param mpls
 * @ignore
 */
export function set_abs_start(mpls: mpls.MPLS) {
  let start_time = 0
  mpls.playlist.playitems.forEach((item) => {
    item._abs_start_time = start_time
    item._play_time_msec = Math.floor((item.out_time - item.in_time) / 45)
    item._play_time_hhmmss = hhmmssmsec(item._play_time_msec)
    start_time += item.out_time - item.in_time
  })

  mpls.playlist_mark.entries.forEach((mark) => {
    const item = mpls.playlist.playitems[mark.play_item_ref]
    if (item) {
      mark._abs_start_msec = Math.floor(((item._abs_start_time || 0) + mark.time - item.in_time) / 45)
      mark._abs_start_hhmmss = hhmmssmsec(mark._abs_start_msec)
    }
  })
}

/**
 *
 * @param total_msec time(msec)
 * @returns 1:23:45.678
 * @ignore
 */
export function hhmmssmsec(total_msec: number) {
  const sec = 1000
  const min = 60 * sec
  const hour = 60 * min

  const hh = Math.floor(total_msec / hour)
  const hh_rest = total_msec - hh * hour
  const mm = Math.floor(hh_rest / min)
  const mm_rest = hh_rest - mm * min
  const ss = Math.floor(mm_rest / sec)
  const ss_rest = mm_rest - ss * sec
  const msec = Math.floor(ss_rest)

  return `${hh >= 100 ? hh : ("00" + hh).slice(-2)}:${("00" + mm).slice(-2)}:${("00" + ss).slice(-2)}.${(
    "000" + msec
  ).slice(-3)}`
}
