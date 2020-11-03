
# Rethink Plaintext Editing

This is our frontend coding challenge. It gives us a chance to see your abilities and how you approach problems. It is designed to give you unlimited creative freedom as you develop a solution. Feel free to use any packages/tools/etc. you'd like to edit text as elegantly as possible. There are a variety of different file types to experiment with as you see fit.

To run the challenge:

- FORK this repo
- Download forked repo and run `npm install && npm run dev`
- Open `localhost:3000` in your browser
- Enjoy

Once complete, please email us a link to your forked repo with clean, tested code. We will use Chrome to run it.

- Rethink Engineering

# My Solution

As a backend engineer, I chose to pursue primarily the non-UI related tasks of this challenge. I first started by adding state for the string in the plaintext editor, to allow for a texteditor which updates the state of files. I then worked on getting persistence across reloads, opting to use the browser `Window.localStorage` Web API. In order to get react state to synchronize with local storage state, I wrote a `usePersistedState` wrapper around `useState` (in `/pages/index.js`). This allows for state which is also serialized to and from browser storage, even in the case of files, which can only be serialized asynchronously.

It is worth noting `usePersistedState` could be abstracted via to and from storage arguments, to make this work on general datatypes. To mess around with the persistence, run `localStorage.clear()` in the console.