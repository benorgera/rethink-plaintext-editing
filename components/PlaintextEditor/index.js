import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import css from './style.css';
import path from 'path';

function PlaintextEditor({ file, write }) {
  console.log(file, write);

  const [fileString, setFileString] = useState('Loading...');

  useEffect(() => {
  	(async () => {
  	    const text = await file.text();
  	    console.log(text);
  	    setFileString(text);
  	})();
  }, [file]); // whenever file changes internally, update the UI

  return (
    <div className={css.editor}>
      <h3>{path.basename(file.name)}</h3>
      <textarea value={fileString}></textarea>
    </div>
  );
}

PlaintextEditor.propTypes = {
  file: PropTypes.object,
  write: PropTypes.func
};

export default PlaintextEditor;
