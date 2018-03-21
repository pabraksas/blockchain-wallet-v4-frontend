import { takeLatest, put, call, select } from 'redux-saga/effects'
import * as AT from './actionTypes'
import * as A from './actions'
import * as sagas from '../../sagas.js'
import { actions } from 'data'
import * as selectors from '../../selectors.js'

export const coinifySignup = function * () {
  try {
    yield call(sagas.core.data.coinify.signup)
    const profile = yield select(selectors.core.data.coinify.getProfile)
    if (!profile.error) {
      yield put(A.coinifyNextStep('payment'))
      yield put(actions.alerts.displaySuccess('Account successfully created!'))
    } else {
      yield put(A.coinifySignupFailure(profile.error))
    }
  } catch (e) {
    yield put(actions.alerts.displayError('Error creating account'))
  }
}

export const coinifySaveMedium = function * (data) {
  const medium = data.payload
  yield put(A.saveMediumSuccess(medium))
  yield put(A.coinifyNextStep('confirm'))
}

export default function * () {
  yield takeLatest(AT.SIGNUP, coinifySignup)
  yield takeLatest(AT.COINIFY_SAVE_MEDIUM, coinifySaveMedium)
}
