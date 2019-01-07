import fs from "fs"
import path from "path"
import * as impl from "../src/mpls_impl"
import { mpls } from "../src/mpls"
import util from "util"

describe("mpls_impl", () => {
  test("hhmmssmsec()", () => {
    expect(impl.hhmmssmsec(3661001)).toBe("01:01:01.001")
  })

  function load_arybuf(file: string) {
    const buf = fs.readFileSync(path.resolve(__dirname, file))
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  }

  function make_arybuf(...nums: number[]) {
    const binary = Uint8Array.of(...nums)
    return binary.buffer
  }

  test("mpls", () => {
    const arybuf = load_arybuf("PLAYLIST/c0.mpls")

    expect(() => impl.mplsImpl(arybuf)).not.toThrowError()
    // const r = impl.mplsImpl(arybuf)
    // console.log(util.inspect(r, { showHidden: false, depth: null }))
    expect(() => mpls(arybuf)).not.toThrowError()
  })

  test("mplsImpl", () => {
    const short_buf = make_arybuf(41, 41, 41, 41, 41, 41, 41, 41)
    expect(() => impl.mplsImpl(short_buf)).toThrow("parse error")
  })
})
