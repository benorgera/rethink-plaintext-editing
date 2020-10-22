import React, { useState, useEffect, forceUpdate } from 'react';
import Head from 'next/head';
import PropTypes from 'prop-types';
import path from 'path';

import classNames from 'classnames';

import { listFiles } from '../files';

// Used below, these need to be registered
import MarkdownEditor from '../MarkdownEditor';
import PlaintextEditor from '../components/PlaintextEditor';

import IconPlaintextSVG from '../public/icon-plaintext.svg';
import IconMarkdownSVG from '../public/icon-markdown.svg';
import IconJavaScriptSVG from '../public/icon-javascript.svg';
import IconJSONSVG from '../public/icon-json.svg';

import css from './style.module.css';

const TYPE_TO_ICON = {
  'text/plain': IconPlaintextSVG,
  'text/markdown': IconMarkdownSVG,
  'text/javascript': IconJavaScriptSVG,
  'application/json': IconJSONSVG
};

// simple local storage persistence
function usePersistedState(key, defaultValue, areFiles) {

  // how files are persisted
  async function toStorage(files) {

    const toJson = async (f) => {
      return {
          lastModified: f.lastModified,
          name: f.name,
          text: await f.text(),
          type: f.type
      }
    };

    return Promise.all(files.map(f => {
      const promise = (async () => await toJson(f))();
  
      return promise;
    }));
  }

  // how files are loaded
  async function fromStorage(jsons) {
    const fromJson = json => new File([json.text], json.name, {
        lastModified: json.lastModified,
        type: json.type
    });

    return jsons.map(j => fromJson(j));
  }

  var resolver;
  const persistedStatePromise = new Promise(resolve => {
    resolver = resolve;
  });

  useEffect(() => {
    resolver(JSON.parse(localStorage.getItem(key)));
  });

  const [state, setState] = useState(defaultValue);

  useEffect(() => {
    (async () => {
      const persistedState = await persistedStatePromise;

      if (persistedState !== null) {
        const decoded = areFiles ? await fromStorage(persistedState) : JSON.parse(persistedState);
        setState(decoded);
      }
    })();
  }, []);

  const persistState = () => {
    (async () => {
      const serializable = areFiles ? await toStorage(state) : JSON.stringify(state);   
      localStorage.setItem(key, JSON.stringify(serializable));
    })();
  };

  useEffect(persistState, [state]);

  return [state, setState, persistState];
}

function FilesTable({ files, activeFileIndex, setActiveFileIndex }) {
  const activeFile = activeFileIndex >= 0;
  return (
    <div className={css.files}>
      <table>
        <thead>
          <tr>
            <th>File</th>
            <th>Modified</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file, index) => (
            <tr
              key={file.name}
              className={classNames(
                css.row,
                index === activeFileIndex && css.active,
              )}
              onClick={() => setActiveFileIndex(index)}
            >
              <td className={css.file}>
                <div
                  className={css.icon}
                  dangerouslySetInnerHTML={{
                    __html: TYPE_TO_ICON[file.type]
                  }}
                ></div>
                {path.basename(file.name)}
              </td>

              <td>
                {new Date(file.lastModified).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

FilesTable.propTypes = {
  files: PropTypes.arrayOf(PropTypes.object),
  activeFileIndex: PropTypes.number,
  setActiveFileIndex: PropTypes.func
};

function Previewer({ file }) {

  const [value, setValue] = useState('');

  useEffect(() => {
    (async () => {
      setValue(await file.text());
    })();
  }, [file]);

  return (
    <div className={css.preview}>
      <div className={css.title}>{path.basename(file.name)}</div>
      <div className={css.content}>{value}</div>
    </div>
  );
}

Previewer.propTypes = {
  file: PropTypes.object
};

// Uncomment keys to register editors for media types
const REGISTERED_EDITORS = {
  "text/plain": PlaintextEditor,
  "text/markdown": MarkdownEditor,
};

const PlaintextFilesChallenge = () => {
  // store these in local storage state
  
  var [files, setFiles, persistFiles] = usePersistedState('RETHINK_CHALLENGE.files', [], true),
      [activeFileIndex, setActiveFileIndex] = usePersistedState('RETHINK_CHALLENGE.activeFile', -1, false);

  // if nothing was found in local store, use default files
  useEffect(() => {
    if (files.length === 0) {
      const defaultFiles = listFiles();
      setFiles(defaultFiles);
    }
  }, []);

  const write = async (file) => {
    const indexOfFile = files.findIndex(f => f.name === file.name);

    if (indexOfFile === undefined) {
      files.push(file);
      indexOfFile = files.length - 1;
    } else {
      files[indexOfFile] = file;
    }

    setFiles(files);
    persistFiles();
  };

  const fileSelected = activeFileIndex >= 0,
        file = fileSelected && files[activeFileIndex],
        Editor = fileSelected && REGISTERED_EDITORS[file.type];

  return (
    <div className={css.page}>
      <Head>
        <title>Rethink Engineering Challenge</title>
      </Head>
      <aside>
        <header>
          <div className={css.tagline}>Rethink Engineering Challenge</div>
          <h1>Fun With Plaintext</h1>
          <div className={css.description}>
            Let{"'"}s explore files in JavaScript. What could be more fun than
            rendering and editing plaintext? Not much, as it turns out.
          </div>
        </header>

        <FilesTable
          files={files}
          activeFileIndex={activeFileIndex}
          setActiveFileIndex={setActiveFileIndex}
        />

        <div style={{ flex: 1 }}></div>

        <footer>
          <div className={css.link}>
            <a href="https://v3.rethink.software/jobs">Rethink Software</a>
            &nbsp;—&nbsp;Frontend Engineering Challenge
          </div>
          <div className={css.link}>
            Questions? Feedback? Email us at jobs@rethink.software
          </div>
        </footer>
      </aside>

      <main className={css.editorWindow}>
        {fileSelected && (
          <>
            {Editor && <Editor file={files[activeFileIndex]} write={write} />}
            {!Editor && <Previewer file={files[activeFileIndex]} />}
          </>
        )}

        {!fileSelected && (
          <div className={css.empty}>Select a file to view or edit</div>
        )}
      </main>
    </div>
  );
}

export default PlaintextFilesChallenge;
