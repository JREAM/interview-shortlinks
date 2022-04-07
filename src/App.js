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
        url: e.target.value // Skipping any "validate/cleanup"
      }).then(result => {
        alert('Link Added (Reloading)')
        window.location.reload(true) //
      }).catch(e => {
        alert('Error: read console');
        console.log(`http:${LINKS_URL}/api/links`);
        console.log(e);
      })
      console.log(postResult);
    } catch (error) {
      console.log(error)
    }
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
            {links.map(link => (
              <tr key={link.uuid}>
                <td>{link.url}</td>
                <td><a href={`${LINKS_URL}/${link.uuid}`} target="_blank" rel="noopener noreferrer">http://{link.uuid}</a></td>
              </tr>
            ))}
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
