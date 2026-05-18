import initRDKitModule from '@rdkit/rdkit/Code/MinimalLib/dist/RDKit_minimal.js'
import rdkitWasmUrl from '@rdkit/rdkit/Code/MinimalLib/dist/RDKit_minimal.wasm?url'

let rdkitPromise = null

export function getRDKitModule() {
  if (!rdkitPromise) {
    rdkitPromise = initRDKitModule({
      locateFile: (file) => {
        if (file.endsWith('.wasm')) {
          return rdkitWasmUrl
        }
        return file
      }
    })
  }
  return rdkitPromise
}
