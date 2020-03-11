import { assoc, curry, map, prop } from 'ramda'
import { createSelector } from 'reselect'
import { selectors } from 'data'
import { TXNotes, Wallet } from 'blockchain-wallet-v4/src/types'

export const getData = (state, coin) => {
  switch (coin) {
    case 'BCH':
      return getBchData(state)
    case 'ETH':
      return getEthData(state)
    default:
      return getBtcData(state)
  }
}

const reportHeaders = [
  'date',
  'time',
  'coin',
  'type',
  'amount',
  'value_then',
  'value_now',
  'exchange_rate_then',
  'tx',
  'note'
]

const getEthData = createSelector(
  [selectors.core.data.eth.getTransactionHistory],
  dataR => {
    const transform = data => {
      const transformedData = map(
        d => [
          d.date,
          d.time,
          'ETH',
          d.type,
          d.amount,
          d.value_then,
          d.value_now,
          d.exchange_rate_then,
          d.hash,
          d.description
        ],
        data
      )
      return [reportHeaders].concat(transformedData)
    }
    return {
      csvData: dataR.map(transform).getOrElse(undefined)
    }
  }
)

const getBtcData = createSelector(
  [
    selectors.core.wallet.getWallet,
    selectors.core.data.btc.getTransactionHistory
  ],
  (wallet, dataR) => {
    const transform = data => {
      const transformedData = map(
        d => [
          d.date,
          d.time,
          'BTC',
          d.type,
          d.amount_btc,
          d.value_then,
          d.value_now,
          d.exchange_rate_then,
          d.tx,
          d.note
        ],
        data
      )
      return [reportHeaders].concat(transformedData)
    }
    return {
      csvData: dataR
        .map(assocBTCNotes(wallet))
        .map(transform)
        .getOrElse(undefined)
    }
  }
)

const getBchData = createSelector(
  [
    selectors.core.kvStore.bch.getBchTxNotes,
    selectors.core.data.bch.getTransactionHistory
  ],
  (notesR, dataR) => {
    const transform = data => {
      const transformedData = map(
        d => [
          d.date,
          d.time,
          'BCH',
          d.type,
          d.amount_bch,
          d.value_then,
          d.value_now,
          d.exchange_rate_then,
          d.tx,
          d.note
        ],
        data
      )
      return [reportHeaders].concat(transformedData)
    }
    const notes = notesR.getOrElse({})
    return {
      csvData: dataR
        .map(assocBCHNotes(notes))
        .map(transform)
        .getOrElse(undefined)
    }
  }
)

const assocBTCNotes = curry((wallet, transactions) => {
  return transactions.map(transaction => {
    const hash = prop('tx', transaction)
    const note = TXNotes.selectNote(hash, Wallet.selectTxNotes(wallet))
    return note ? assoc('note', note, transaction) : transaction
  })
})

const assocBCHNotes = curry((notes, transactions) => {
  return transactions.map(transaction => {
    const hash = prop('tx', transaction)
    const note = notes && notes[hash]
    return note ? assoc('note', note, transaction) : transaction
  })
})
