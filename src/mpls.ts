import { mplsImpl } from "./mpls_impl"

// not use `export declare namespace` for typedoc
export namespace mpls {
  export interface MPLS {
    _size_of_file: number
    type_indicator: string
    type_indicator2: string
    playlist_start_address: number
    playlist_mark_start_address: number
    extension_data_start_address: number
    app_info_play_list: AppInfoPlayList
    playlist: PlayList
    playlist_mark: PlayListMark
  }

  export interface AppInfoPlayList {
    length: number
    playlist_playback_type: number
    playback_count?: number
    UO_mask_table: ArrayBuffer
    playlist_random_access_flag: boolean
    audio_mix_app_flag: boolean
    lossless_may_bypass_mixer_flag: boolean
  }

  export interface PlayList {
    length: number
    number_of_playitems: number
    number_of_subpaths: number
    playitems: Array<PlayItem>
    subpaths: Array<Subpath>
  }

  export interface PlayItem {
    length: number
    clip_file: string
    codec_id: string
    is_multi_angle: boolean
    connection_condition: number
    stc_id: number
    in_time: number
    out_time: number
    UO_mask_table: ArrayBuffer
    random_access_flag: boolean
    still_mode: number
    still_time?: number
    num_angles?: number
    is_different_audios?: boolean
    is_seamless_angle_change?: boolean
    multi_angle_items?: Array<MultiAngleItem>
    stn?: PlaylistSTN
    _abs_start_time?: number
    _play_time_msec?: number
    _play_time_hhmmss?: string
  }

  export interface Subpath {
    length: number
    type: number
  }

  export interface SubPlayItem {
    length: number
    clip_file: string
    codec_id: string
  }

  export interface MultiAngleItem {
    clip_file: string
    clip_codec_id: string
    stc_id: number
  }

  export interface PlaylistSTN {
    length: number
    num_primary_video: number
    num_primary_audio: number
    num_pg: number
    num_ig: number
    num_secondary_audio: number
    num_secondary_video: number
    num_PIP_PG: number
    streams: Array<Stream>
  }

  export interface Stream {
    length: number
    stream_type: number
    subpath_id?: number
    subclip_id?: number
    pid?: number
    attributes: StreamAttributes
  }

  export interface StreamAttributes {
    length: number
    coding_type: number
    _coding_type?: string
    format?: number
    _format?: string
    rate?: number
    _rate?: string
    lang_code?: string
    char_code?: number
  }

  export interface SubPath {
    length: number
  }

  export interface PlayListMark {
    length: number
    number_marks: number
    entries: Array<Mark>
  }

  export interface Mark {
    mark_type: number
    play_item_ref: number
    time: number
    entry_es_pid: number
    duration: number
    _abs_start_msec?: number
    _abs_start_hhmmss?: string
  }
}

/**
 *
 * @param buf
 */
export function mpls(buf: ArrayBuffer) {
  return mplsImpl(buf)
}
