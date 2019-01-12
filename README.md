# @yagisumi/mpls

Dump blu-ray mpls to extract chapters.

[![NPM version][npm-image]][npm-url] [![install size][packagephobia-image]][packagephobia-url] [![DefinitelyTyped][dts-image]][dts-url]  
[![Build Status][travis-image]][travis-url] [![Coverage percentage][coveralls-image]][coveralls-url]

## Installation

```sh
$ npm i @yagisumi/mpls
```

## Usage

- javascript

```js
const mpls = require('@yagisumi/mpls').mpls;

mpls(arybuf);
```

- typescript

```ts
import { mpls } from '@yagisumi/mpls';

mpls(arybuf);
```

- web browser

```html
<script src='https://unpkg.com/@yagisumi/mpls'></script>
```

## Example

```js
const mpls = require("@yagisumi/mpls").mpls
const fs = require("fs")
const util = require("util")

const buf = fs.readFileSync("00000.mpls")
const arybuf = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
const dump = mpls(arybuf)
console.log(util.inspect(dump, false, null))

// output example
{ _buffer_length: 212,
  type_indicator: 'MPLS',
  type_indicator2: '0200',
  playlist_start_address: 58,
  playlist_mark_start_address: 150,
  extension_data_start_address: 0,
  app_info_play_list:
   { length: 14,
     playlist_playback_type: 0,
     playlist_random_access_flag: false,
     audio_mix_app_flag: true,
     lossless_may_bypass_mixer_flag: false,
     UO_mask_table: ArrayBuffer { byteLength: 8 } },
  playlist:
   { length: 88,
     number_of_playitems: 1,
     number_of_subpaths: 0,
     playitems:
      [ { length: 80,
          clip_file: '00000',
          codec_id: 'M2TS',
          is_multi_angle: false,
          connection_condition: 1,
          stc_id: 0,
          in_time: 27000000,
          out_time: 183264108,
          UO_mask_table: ArrayBuffer { byteLength: 8 },
          random_access_flag: false,
          still_mode: 0,
          stn:
           { length: 46,
             num_primary_video: 1,
             num_primary_audio: 1,
             num_pg: 0,
             num_ig: 0,
             num_secondary_audio: 0,
             num_secondary_video: 0,
             num_PIP_PG: 0,
             streams:
              [ { length: 9,
                  stream_type: 1,
                  attributes:
                   { length: 5,
                     coding_type: 27,
                     _coding_type: 'H.264',
                     format: 4,
                     rate: 4,
                     _format: '1080i',
                     _rate: '29.97',
                     _type: 'video' },
                  pid: 4113 },
                { length: 9,
                  stream_type: 1,
                  attributes:
                   { length: 5,
                     coding_type: 129,
                     _coding_type: 'AC-3',
                     format: 3,
                     rate: 1,
                     _format: 'Stereo',
                     _rate: '48Khz',
                     lang_code: 'eng',
                     _type: 'audio' },
                  pid: 4352 } ] },
          _abs_start_time: 0,
          _play_time_msec: 3472535,
          _play_time_hhmmss: '00:57:52.535' } ],
     subpaths: [] },
  playlist_mark:
   { length: 58,
     number_marks: 4,
     entries:
      [ { mark_type: 1,
          play_item_ref: 0,
          time: 27000000,
          entry_es_pid: 65535,
          duration: 0,
          _abs_start_msec: 0,
          _abs_start_hhmmss: '00:00:00.000' },
        { mark_type: 1,
          play_item_ref: 0,
          time: 67500000,
          entry_es_pid: 65535,
          duration: 0,
          _abs_start_msec: 900000,
          _abs_start_hhmmss: '00:15:00.000' },
        { mark_type: 1,
          play_item_ref: 0,
          time: 108000000,
          entry_es_pid: 65535,
          duration: 0,
          _abs_start_msec: 1800000,
          _abs_start_hhmmss: '00:30:00.000' },
        { mark_type: 1,
          play_item_ref: 0,
          time: 148500000,
          entry_es_pid: 65535,
          duration: 0,
          _abs_start_msec: 2700000,
          _abs_start_hhmmss: '00:45:00.000' } ] } }
```

## Documentation

https://yagisumi.github.io/node-mpls/

## License

[MIT License](https://opensource.org/licenses/MIT)

[npm-image]: https://img.shields.io/npm/v/@yagisumi/mpls.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@yagisumi/mpls
[packagephobia-image]: https://flat.badgen.net/packagephobia/install/@yagisumi/mpls
[packagephobia-url]: https://packagephobia.now.sh/result?p=@yagisumi/mpls
[travis-image]: https://img.shields.io/travis/yagisumi/node-mpls.svg?style=flat-square
[travis-url]: https://travis-ci.org/yagisumi/node-mpls
[coveralls-image]: https://img.shields.io/coveralls/yagisumi/node-mpls.svg?style=flat-square
[coveralls-url]: https://coveralls.io/github/yagisumi/node-mpls?branch=master
[dts-image]: https://img.shields.io/badge/DefinitelyTyped-.d.ts-blue.svg?style=flat-square
[dts-url]: http://definitelytyped.org
