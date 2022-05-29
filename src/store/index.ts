import Swiper from 'model/swiper'

export default function createStore<T>(getFunc: () => Promise<T>) {
  let dirty = true
  let data: T | null = null
  return {
    async getData() {
      if (dirty) {
        const result = await getFunc()
        if (result) {
          dirty = false
        }
        data = result
      }
      return data
    },
    setDirty() {
      dirty = false
    },
  }
}

export const swipeStore = createStore(Swiper.getRecentRecords)
