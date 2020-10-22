import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import css from './style.css';
import path from 'path';

function PlaintextEditor({ file, write }) {

  const [fileString, setFileString] = useState('Loading...');

  // load the file blob text
  useEffect(() => {
  	(async () => {
  	    const text = await file.text();
  	    setFileString(text);
  	})();
  }, [file]); // rerun the text load effect when the file prop changes

  function onEdit(e) {
  	const newString = e.target.value;

  	setFileString(newString); // update text area

  	// trigger write event upstream (has effect of changing file prop)
	  write(new File([newString], file.name, {
	    lastModified: Date.now(),
	    type: file.type
	  }));
  }

  return (
    <div className={css.editor}>
      <div className={css.title}>{path.basename(file.name)}</div>
      <textarea className={css.content} value={fileString} rows={15} onChange={onEdit}></textarea>
    </div>
  );
}


PlaintextEditor.propTypes = {
  file: PropTypes.object,
  write: PropTypes.func
};

export default PlaintextEditor;
