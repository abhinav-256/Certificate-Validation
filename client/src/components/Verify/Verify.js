import React, { useState } from 'react'
import './Verify.scss'
import { images } from "../../constants"
import TextField from '@mui/material/TextField';
import Input from "@mui/material/Input";
import Button from "@mui/material/Button";
import axios from 'axios';
import { verifyProof } from 'merkletree'

let i;
let fileData;

function Login() {

  const [user, setUser] = useState({
    name: "",
    batch: "",
    fileHash: "",
  });

  const handleInputs = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleCert = (e) => {
    const jssha = require('jssha')
    const fileReader = new FileReader();
    fileReader.readAsBinaryString(e.target.files[0]);
    fileReader.onload = (e) => {
      fileData = e.target.result
      var sha3 = new jssha("SHA3-256", "BYTES")
      sha3.update(fileData.toString());
      var leaf = sha3.getHash("HEX")
      setUser({ ...user, fileHash: leaf });
    };
  };

  const PostData = async (e) => {
    e.preventDefault();

    console.log(user.name)
    console.log(user.batch)
    console.log(user.fileHash)

    axios.get("http://localhost:4000/getCertificate/", { params: { "name": user.name, "batch": user.batch } })
      .then((response) => {
        if (response.data.length === 0) {
          console.log("Can't Find the certificate.")
        } else {
          let userData = response.data[0]
          let certificates = userData["certificate"]
          let root = userData["merkleRoot"]
          let cert_length = Object.keys(certificates).length

          for (i = 0; i < cert_length; i++) {
            if (user.fileHash === certificates[i]["hash"]) {
              // Leaf of the pdf file
              var proof = certificates[i]["proof"]
            }
          }

          const verified = verifyProof(user.fileHash, root, proof)
          console.log(verified)
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <div className="app__header app__flex">
      <div className="app__header-badge">
        <div className="badge-cmp app__flex">
          <div style={{ marginLeft: 20 }}>
            <p className="p-text">Prove authenticity</p>
            <h1 className="head-texter">Verify Ceritficate!</h1>
          </div>
        </div>

        <div className="tag-cmp ">
          <form>
            <TextField id="outlined-basic"
              label="Name"
              name="name"
              type="text"
              value={user.name}
              onChange={handleInputs}
            />
            <TextField
              id="outlined-basic"
              label="Batch"
              name="batch"
              type="text"
              value={user.batch}
              onChange={handleInputs}
            />
            <br></br>
            <br></br>
            <label>
              <h3>Choose your certificate (pdf): </h3>
            </label>
            <Input
              type="file"
              name="certificate"
              id="myFile"
              onChange={handleCert}
            /> <br></br><br></br>
            <Button
              type="submit"
              variant="contained"
              onClick={PostData}
            >
              Submit
            </Button>
          </form>
        </div>
      </div>

      <img src={images.react} alt="profile_bg" />

    </div>
  )
}

export default Login