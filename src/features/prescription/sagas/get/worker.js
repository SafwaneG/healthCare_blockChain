import { put, select } from "redux-saga/effects";
import Web3 from "web3";
import helpers from "helpers";
import contractAddress from "config/contractAddress";
import { abi } from "config/contractAbi";
import actions from "features/prescription/actions";
import errorsActions from "store/errors/actions";
import authSelectors from "features/auth/selectors";
import patientSelectors from "features/patients/selectors";
function* getWorker({ meta = {} }) {
  const patient = yield select(patientSelectors.detailedSelected);
  const user = yield select(authSelectors.user);

  const web3 = new Web3(window.ethereum);
  yield put(errorsActions.cleaned());
  const provider = window.ethereum;
  yield provider.request({ method: "eth_requestAccounts" });
  const accounts = yield web3.eth.getAccounts();
  const account = accounts[0];
  const contract = new web3.eth.Contract(abi, contractAddress.address);

  let result;
  if (user?.userNature === "doctor") {
    result = yield contract.methods
      .getPrescriptionDetails(patient?.doctorAddress)
      .call({ from: account });
  } else {
    result = yield contract.methods
      .getPrescriptionDetails(account)
      .call({ from: account });
  }
  console.log(result);

  const prescriptions = result.map((prescription) =>
    JSON.stringify(prescription, (key, value) => {
      if (typeof value === "bigint") {
        return value.toString();
      }
      return value;
    })
  );
  let medicalPrescription = [];

  for (let i = 0; i < prescriptions.length; i++) {
    const prescription = JSON.parse(prescriptions[i]);
    const patientDetails = yield contract.methods
      .getUserInfo(prescription?.patient)
      .call({ from: account });
    const doctorDetails = yield contract.methods
      .getUserInfo(prescription?.doctor)
      .call({ from: account });
    medicalPrescription[i] = {
      ...prescription,
      patientName: patientDetails[1],
      doctorName: doctorDetails[1],
    };
  }
  console.log(medicalPrescription);
  yield put(
    actions.merged({
      prescriptions: [...medicalPrescription],
    })
  );
}
export default getWorker;