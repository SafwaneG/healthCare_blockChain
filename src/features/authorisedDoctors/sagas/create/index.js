import { takeLatest } from "redux-saga/effects";
import actionsTypes from "features/medicalRecord/actionsTypes";
import worker from "./worker";
function* createRecord() {
  yield takeLatest(actionsTypes.create, worker);
}

export default createRecord;
