import { merge } from 'ramda'

export default ({ apiUrl, get, post }) => {
  const fetchBchData = (
    context: Array<string> | string,
    {
      n = 50,
      offset = 0,
      onlyShow
    }: {
      n: number
      offset?: number
      onlyShow?: Array<string> | string
    },
    nextUrl?: string | null
  ) => {
    const data = {
      active: (Array.isArray(context) ? context : [context]).join('|'),
      offset: offset,
      ct: new Date().getTime(),
      n: n
    }
    return nextUrl
      ? post({ url: nextUrl })
      : post({
          url: apiUrl,
          endPoint: '/bch/multiaddr',
          data: onlyShow
            ? merge(data, {
                onlyShow: (Array.isArray(onlyShow)
                  ? onlyShow
                  : [onlyShow]
                ).join('|')
              })
            : data
        })
  }

  const getBchTicker = () =>
    get({
      url: apiUrl,
      endPoint: '/ticker',
      data: { base: 'BCH' }
    })

  const getBchUnspents = (fromAddresses, confirmations = 0) =>
    post({
      url: apiUrl,
      endPoint: '/bch/unspent',
      data: {
        active: fromAddresses.join('|'),
        confirmations: Math.max(confirmations, -1),
        format: 'json'
      }
    })

  const pushBchTx = (tx, lock_secret) =>
    post({
      url: apiUrl,
      endPoint: '/bch/pushtx',
      data: { tx, lock_secret, format: 'plain' }
    })

  const getBchRawTx = txHex =>
    get({
      url: apiUrl,
      endPoint: '/bch/rawtx/' + txHex,
      data: {
        format: 'hex',
        cors: 'true'
      }
    })

  const getBchDust = () =>
    get({
      url: apiUrl,
      endPoint: '/bch/dust'
    })

  const getBchFees = () =>
    get({
      url: apiUrl,
      endPoint: '/mempool/fees/bch'
    })

  return {
    fetchBchData,
    getBchDust,
    getBchFees,
    getBchRawTx,
    getBchTicker,
    getBchUnspents,
    pushBchTx
  }
}
