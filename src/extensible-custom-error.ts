export default class ExtensibleCustomError extends Error {
  constructor(message?: string, error?: Error)
  constructor(error: Error)
  constructor(...args: any[]) {
    let errorToWrap: Error | null = null
    let message: string | undefined = undefined

    if (typeof args[0] === "string") {
      message = args[0]
    }

    if (args[0] instanceof Error) {
      errorToWrap = args[0]
    } else if (args[1] instanceof Error) {
      errorToWrap = args[1]
    }

    super(message)

    Object.defineProperty(this, "name", {
      configurable: true,
      enumerable: false,
      value: this.constructor.name,
      writable: true,
    })

    if (errorToWrap && errorToWrap.stack) {
      if (Error.hasOwnProperty("captureStackTrace")) {
        Error.captureStackTrace(this, this.constructor)
        if (this.stack) {
          this.stack = this.mergeStackTrace(this.stack, errorToWrap.stack)
        }
        return
      }

      // This class is supposed to be extended, so the first two lines from
      // the second line are about error object constructors.
      const e = new Error(message)
      if (e.stack) {
        const stackTraceEntries = e.stack.split("\n")
        const stackTraceWithoutConstructors = [stackTraceEntries[0], ...stackTraceEntries.slice(3)].join("\n")

        this.stack = this.mergeStackTrace(stackTraceWithoutConstructors, errorToWrap.stack)
      }
    }
  }

  private mergeStackTrace(stackTraceToMerge: string, baseStackTrace: string) {
    if (!baseStackTrace) {
      return stackTraceToMerge
    }

    const entriesToMerge = stackTraceToMerge.split("\n")
    const baseEntries = baseStackTrace.split("\n")

    const newEntries: Array<string> = []

    entriesToMerge.forEach((entry) => {
      if (baseEntries.includes(entry)) {
        return
      }

      newEntries.push(entry)
    })

    return [...newEntries, ...baseEntries].join("\n")
  }
}
