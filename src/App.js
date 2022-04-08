import React, { useEffect, useState } from 'react';
import logo from './link.svg';
import './App.css';
import config from './config.json';
import axios from 'axios';

const LINKS_URL = `//${config.SERVE_HOSTNAME}:${config.SERVE_PORT}`;

function App() {

  const [links, setLinks]=useState([]);

  // An effect to fetch the data
  useEffect(() => {
    axios.get(`http://${LINKS_URL}/api/links`)
      .then((result) => {
        setLinks(result.data.result);  // ugly to read, but it works
      }).catch((e) => {
        console.log(e)
      });
  }, []);

  const handleDelete=(e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to Delete?') != true) {
      return;
    }
    // e.target.whatever.parent delete
    axios.delete(`http://${LINKS_URL}/api/links`)
      .then(() => {
        alert('Delete successful')
      })
      .catch((e) => {
        alert('error')
      })
  }


  const handleSubmit=(e) => {
    e.preventDefault()
    const url=e.target.url.value

    // Quick/Dirty copy/paste regex test
    var r = /^(ftp|http|https):\/\/[^ "]+$/;
    if (!r.test(url)) {
      alert("Invalid URL");
      return;
    }

    try {
      const postResult = axios.post(`http:${LINKS_URL}/api/links`, {
        url: e.target.url.value // Skipping any "validate/cleanup"
      }).then(result => {
        // console.log(result.data)
        alert('Link Added (Reloading)')
        window.location.reload(true) //
      }).catch(e => {
        alert(e)
      })
    } catch (e) {
      console.log(e)
      alert(e)
    }
  }

  let linkContent;
  if (links.length>0) {
    linkContent = links.map(link => (
      <tr key={link.uuid}>
        <td>{link.url}</td>
        <td><a href={`${LINKS_URL}/${link.uuid}`} target="_blank" rel="noopener noreferrer">http://{link.uuid}</a></td>
        <td><a href="#" onClick={handleDelete} >Delete</a></td>
      </  tr>
    ))
  } else {
    linkContent = <tr><td colSpan="2">No Links <em className="subtle">(Is the backend running?)</em></td></tr>
  }

  // Output
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Shortlinks</h1>
      </header>
      <div className="row">
        <div className="left">
          <h2>Your Links</h2>
          <table className="records">
            <thead>
              <tr>
                <td>Original URL</td>
                <td>Short Link</td>
              </tr>
            </thead>
            <tbody>
              {linkContent}
            </tbody>
          </table>
        </div>
        <div className="right">
          <h2>Create New</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="url"
              className="url"
              placeholder="https://"
              />
            <input
              type="submit"
              className="create"
              value="Create Shortlink"
              />
            </form>
        </div>
      </div>
    </div>
  );
}

export default App;
