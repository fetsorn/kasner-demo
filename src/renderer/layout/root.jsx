import React, { useState, useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import Parser from 'rss-parser';
import { useStore } from '@/store/index.js';
import styles from './root.module.css';
import {
  addressAlice,
  pkAlice,
  addressBob,
  pkBob,
  addressTony,
  pkTony,
  addressKasner,
  addressToken,
  addressProportional
} from '@/constants.js';
import { ethers } from 'ethers';
// import artifactKasner from 'kasner/artifacts/Kasner.sol/Kasner.json';
import { MerkleTree } from 'merkletreejs';
import CryptoJS from 'crypto-js';
import CopyIcon from './copy.svg';

export function Root() {
  return (
    <Router>
      <Routes>
        <Route index element={<Page />} />
      </Routes>
    </Router>
  );
}

var kasnerState = {
  salt: {},
  saltHash: {},
  root: {},
}

const kasner = {
  target: "0xacad",
  commitAnswer: (root, saltHash) => {
    kasnerState.root[kasner.target] = root;
    kasnerState.saltHash[kasner.target] = saltHash;
  },
  revealAnswer: (salt) => {
    kasnerState.salt[kasner.target] = salt;
  },
  getRoot: (address) => kasnerState.root[address],
  getSalt: (address) => kasnerState.salt[address],
  getSaltHash: (address) => kasnerState.saltHash[address],
  connect: (address) => ({
    commitGuess: (root, saltHash) => {
      kasnerState.root[address] = root;
      kasnerState.saltHash[address] = saltHash;
    },
    revealGuess: (salt) => {
      kasnerState.salt[address] = salt;
    },
  })
}

function reducer(state, action) {
  switch (action.type) {
    case 'started': {
      return {
        ...state,
        isLoading: true
      };
    }
    case 'finished': {
      return {
        ...state,
        isLoading: false
      };
    }
    case 'connected': {
      return {
        ...state,
        hasConnected: true,
        provider: action.provider,
        signer: action.signer,
        // kasner: action.kasner,
        alice: {
          ...state.alice,
          signer: action.signerAlice
        },
        bob: {
          ...state.bob,
          signer: action.signerBob
        },
        tony: {
          ...state.tony,
          signer: action.signerBob
        }
      };
    }
    case 'generated_quiz': {
      return {
        ...state,
        quiz: action.quiz
      }
    }
    case 'planted_correct': {
      return {
        ...state,
        correct: {
          ...state.correct,
          salt: action.salt,
          saltHash: action.saltHash,
          root: action.root
        }
      }
    }
    case 'committed_correct': {
      return {
        ...state,
        correct: {
          ...state.correct,
          hasCommitted: true
        }
      }
    }
    case 'ended_quiz': {
      return {
        ...state,
        hasEndedQuiz: true
      }
    }
    case 'guessed_alice': {
      return {
        ...state,
        alice: {
          ...state.alice,
          guess: {
            ...state.alice.guess,
            [action.key]: action.value
          }
        }
      }
    }
    case 'guessed_bob': {
      return {
        ...state,
        bob: {
          ...state.bob,
          guess: {
            ...state.bob.guess,
            [action.key]: action.value
          }
        }
      }
    }
    case 'guessed_tony': {
      return {
        ...state,
        tony: {
          ...state.tony,
          guess: {
            ...state.tony.guess,
            [action.key]: action.value
          }
        }
      }
    }
    case 'planted_alice': {
      return {
        ...state,
        alice: {
          ...state.alice,
          salt: action.salt,
          saltHash: action.saltHash,
          root: action.root
        }
      }
    }
    case 'planted_bob': {
      return {
        ...state,
        bob: {
          ...state.bob,
          salt: action.salt,
          saltHash: action.saltHash,
          root: action.root
        }
      }
    }
    case 'planted_tony': {
      return {
        ...state,
        tony: {
          ...state.tony,
          salt: action.salt,
          saltHash: action.saltHash,
          root: action.root
        }
      }
    }
    case 'committed_alice': {
      return {
        ...state,
        alice: {
          ...state.alice,
          hasCommitted: true
        }
      }
    }
    case 'committed_bob': {
      return {
        ...state,
        bob: {
          ...state.bob,
          hasCommitted: true
        }
      }
    }
    case 'committed_tony': {
      return {
        ...state,
        tony: {
          ...state.tony,
          hasCommitted: true
        }
      }
    }
    case 'revealed_correct': {
      return {
        ...state,
        correct: {
          ...state.correct,
          hasRevealed: true
        }
      }
    }
    case 'revealed_alice': {
      return {
        ...state,
        alice: {
          ...state.alice,
          hasRevealed: true
        }
      }
    }
    case 'revealed_bob': {
      return {
        ...state,
        bob: {
          ...state.bob,
          hasRevealed: true
        }
      }
    }
    case 'revealed_tony': {
      return {
        ...state,
        tony: {
          ...state.tony,
          hasRevealed: true
        }
      }
    }
    case 'verified_correct': {
      return {
        ...state,
        correct: {
          ...state.correct,
          isVerified: {
            ...state.correct.isVerified,
            [action.key]: action.isVerified
          }
        }
      }
    }
    case 'verified_alice': {
      return {
        ...state,
        alice: {
          ...state.alice,
          isVerified: {
            ...state.alice.isVerified,
            [action.key]: action.isVerified
          }
        }
      }
    }
    case 'verified_bob': {
      return {
        ...state,
        bob: {
          ...state.bob,
          isVerified: {
            ...state.bob.isVerified,
            [action.key]: action.isVerified
          }
        }
      }
    }
    case 'verified_tony': {
      return {
        ...state,
        tony: {
          ...state.tony,
          isVerified: {
            ...state.tony.isVerified,
            [action.key]: action.isVerified
          }
        }
      }
    }
  }
  throw Error('Unknown action: ' + action.type);
}

const initialState = {
  isLoading: false,
  hasConnected: false,
  quiz: undefined,
  provider: undefined,
  signer: undefined,
  hasEndedQuiz: undefined,
  correct: {
    guess: {
      0: "banana",
      1: "knife"
    },
    salt: undefined,
    saltHash: undefined,
    root: undefined,
    hasCommitted: false,
    hasRevealed: false,
    isVerified: {
      guess: undefined,
      salt: undefined
    }
  },
  alice: {
    signer: undefined,
    guess: {
      0: "no guess",
      1: "no guess"
    },
    salt: undefined,
    saltHash: undefined,
    root: undefined,
    hasCommitted: false,
    hasRevealed: false,
    isVerified: {
      guess: undefined,
      salt: undefined
    }
  },
  bob: {
    signer: undefined,
    guess: {
      0: "no guess",
      1: "no guess"
    },
    salt: undefined,
    saltHash: undefined,
    root: undefined,
    hasCommitted: false,
    hasRevealed: false,
    isVerified: {
      guess: undefined,
      salt: undefined
    }
  },
  tony: {
    signer: undefined,
    guess: {
      0: "no guess",
      1: "no guess"
    },
    salt: undefined,
    saltHash: undefined,
    root: undefined,
    hasCommitted: false,
    hasRevealed: false,
    isVerified: {
      guess: undefined,
      salt: undefined
    }
  }
}

function Page() {

  const [state, dispatch] = useReducer(reducer, initialState);

  async function connectWallet() {
    dispatch({type: "started"});

    const provider = new ethers.BrowserProvider(window.ethereum);

    const signer = await provider.getSigner();

    // const _kasner = new ethers.Contract(addressKasner, artifactKasner.abi, _signer);

    // setKasner(_kasner);

    const signerAlice = new ethers.Wallet(pkAlice, provider);

    const signerBob = new ethers.Wallet(pkBob, provider);

    const signerTony = new ethers.Wallet(pkTony, provider);

    dispatch({
      type: 'connected',
      provider,
      signer,
      // kasner,
      signerAlice,
      signerBob,
      signerTony
    });

    dispatch({type: "finished"});
  }

  function generateQuiz() {
    dispatch({
      type: 'generated_quiz',
      quiz: {
        "tomato": window.crypto.randomUUID(),
        "banana": window.crypto.randomUUID(),
        "potato": window.crypto.randomUUID(),
        "knife": window.crypto.randomUUID(),
        "pillow": window.crypto.randomUUID(),
        "finger": window.crypto.randomUUID()
      }
    });
  }

  function plantTree(answers) {
    const salt = window.crypto.randomUUID();

    const saltHash = CryptoJS.SHA256(salt).toString(CryptoJS.enc.Hex);

    const leaves = answers
          .map(answer => state.quiz[answer])
          .map(uuid => CryptoJS.SHA256(`${uuid}${salt}`));

    const tree = new MerkleTree(leaves);

    const root = tree.getRoot().toString('hex');

    return [salt, saltHash, root]
  }

  async function commitCorrect() {
    dispatch({type: "started"});

    const answers = [state.correct.guess[0], state.correct.guess[1]];

    const [salt, saltHash, root] = plantTree(answers);

    dispatch({
      type: "planted_correct",
      root,
      salt,
      saltHash
    });

    await kasner.commitAnswer(root, saltHash);

    dispatch({
      type: "committed_correct"
    });

    dispatch({type: "finished"});
  }

  function guess0Alice({ target: { value } }) {
    dispatch({type: "guessed_alice", key: 0, value});
  }

  function guess0Bob({ target: { value } }) {
    dispatch({type: "guessed_bob", key: 0, value});
  }

  function guess0Tony({ target: { value } }) {
    dispatch({type: "guessed_tony", key: 0, value});
  }

  function guess1Alice({ target: { value } }) {
    dispatch({type: "guessed_alice", key: 1, value});
  }

  function guess1Bob({ target: { value } }) {
    dispatch({type: "guessed_bob", key: 1, value});
  }

  function guess1Tony({ target: { value } }) {
    dispatch({type: "guessed_tony", key: 1, value});
  }

  async function commitAlice() {
    dispatch({type: "started"});

    const [salt, saltHash, root] = plantTree([state.alice.guess[0], state.alice.guess[1]]);

    dispatch({
      type: "planted_alice",
      root,
      salt,
      saltHash
    });

    await kasner.connect(addressAlice).commitGuess(root, saltHash);

    dispatch({
      type: "committed_alice"
    });

    dispatch({type: "finished"});
  }

  async function commitBob() {
    dispatch({type: "started"});

    const [salt, saltHash, root] = plantTree([state.bob.guess[0], state.bob.guess[1]]);

    dispatch({
      type: "planted_bob",
      root,
      salt,
      saltHash
    });

    await kasner.connect(addressBob).commitGuess(root, saltHash);

    dispatch({
      type: "committed_bob"
    });

    dispatch({type: "finished"});
  }

  async function commitTony() {
    dispatch({type: "started"});

    const [salt, saltHash, root] = plantTree([state.tony.guess[0], state.tony.guess[1]]);

    dispatch({
      type: "planted_tony",
      root,
      salt,
      saltHash
    });

    await kasner.connect(addressTony).commitGuess(root, saltHash);

    dispatch({
      type: "committed_tony"
    });

    dispatch({type: "finished"});
  }

  async function endQuiz() {
    dispatch({
      type: "ended_quiz"
    });
  }

  async function revealCorrect() {
    dispatch({type: "started"});

    await kasner.revealAnswer(state.correct.salt);

    dispatch({
      type: "revealed_correct"
    });

    dispatch({type: "finished"});
  }

  async function revealAlice() {
    dispatch({type: "started"});

    await kasner.connect(addressAlice).revealGuess(state.alice.salt);

    dispatch({
      type: "revealed_alice"
    });

    dispatch({type: "finished"});
  }

  async function revealBob() {
    dispatch({type: "started"});

    await kasner.connect(addressBob).revealGuess(state.bob.salt);

    dispatch({
      type: "revealed_bob"
    });

    dispatch({type: "finished"});
  }

  async function revealTony() {
    dispatch({type: "started"});

    await kasner.connect(addressTony).revealGuess(state.tony.salt);

    dispatch({
      type: "revealed_tony"
    });

    dispatch({type: "finished"});
  }

  function verifySalt(salt, saltHash) {
    return saltHash === CryptoJS.SHA256(salt).toString(CryptoJS.enc.Hex);
  }

  async function verifySaltCorrect() {
    dispatch({type: "started"});

    const saltHash = await kasner.getSaltHash(kasner.target);

    const isVerified = verifySalt(state.correct.salt, saltHash);

    dispatch({type: "verified_correct", key: "salt", isVerified});

    dispatch({type: "finished"});
  }

  async function verifySaltAlice() {
    dispatch({type: "started"});

    const saltHash = await kasner.getSaltHash(addressAlice);

    const isVerified = verifySalt(state.alice.salt, saltHash);

    dispatch({type: "verified_alice", key: "salt", isVerified});

    dispatch({type: "finished"});
  }

  async function verifySaltBob() {
    dispatch({type: "started"});

    const saltHash = await kasner.getSaltHash(addressBob);

    const isVerified = verifySalt(state.bob.salt, saltHash);

    dispatch({type: "verified_bob", key: "salt", isVerified});

    dispatch({type: "finished"});
  }

  async function verifySaltTony() {
    dispatch({type: "started"});

    const saltHash = await kasner.getSaltHash(addressTony);

    const isVerified = verifySalt(state.tony.salt, saltHash);

    dispatch({type: "verified_tony", key: "salt", isVerified});

    dispatch({type: "finished"});
  }

  async function verifyGuess(address, answers) {
    const root = await kasner.getRoot(address);

    const salt = await kasner.getSalt(address);

    const leaves = answers
          .map(answer => state.quiz[answer])
          .map(uuid => CryptoJS.SHA256(`${uuid}${salt}`));

    const tree = new MerkleTree(leaves);

    return root === tree.getRoot().toString('hex');
  }

  async function verifyGuessCorrect() {
    dispatch({type: "started"});

    const answers = [state.correct.guess[0], state.correct.guess[1]];

    const isVerified = await verifyGuess(kasner.target, answers);

    dispatch({type: "verified_correct", key: "guess", isVerified});

    dispatch({type: "finished"});
  }

  async function verifyGuessAlice() {
    dispatch({type: "started"});

    const answers = [state.alice.guess[0], state.alice.guess[1]];

    const isVerified = await verifyGuess(addressAlice, answers);

    dispatch({type: "verified_alice", key: "guess", isVerified});

    dispatch({type: "finished"});
  }

  async function verifyGuessBob() {
    dispatch({type: "started"});

    const answers = [state.bob.guess[0], state.bob.guess[1]];

    const isVerified = await verifyGuess(addressBob, answers);

    dispatch({type: "verified_bob", key: "guess", isVerified});

    dispatch({type: "finished"});
  }

  async function verifyGuessTony() {
    dispatch({type: "started"});

    const answers = [state.tony.guess[0], state.tony.guess[1]];

    const isVerified = await verifyGuess(addressTony, answers);

    dispatch({type: "verified_tony", key: "guess", isVerified});

    dispatch({type: "finished"});
  }

  return (
    <>
      <main className={styles.main}>
        {!state.hasConnected ? (
          <button onClick={connectWallet}>connect wallet</button>
        ) : (
          `moderator address: ${state.signer.address}`
        )}

        <br/>

        {state.hasConnected && !state.quiz && (
          <button onClick={generateQuiz}>generate quiz</button>
        )}

        {state.quiz && (
          <div>quiz generated</div>
        )}

        {state.quiz && !state.correct.hasCommitted && (
          <div>
            <button onClick={commitCorrect}>commit to correct answers</button>
          </div>
        )}

        {state.correct.saltHash && (
          <div>
            <span>salt hash: {state.correct.saltHash}</span>
            <Copy text={state.correct.saltHash}/>
          </div>
        )}

        {state.correct.root && (
          <div>
            <span>root: {state.correct.root}</span>
            <Copy text={state.correct.root}/>
          </div>
        )}

        {state.correct.hasCommitted && (
          <div>committed</div>
        )}

        {state.quiz &&
         state.correct.hasCommitted &&
         state.alice.hasCommitted &&
         state.bob.hasCommitted &&
         state.tony.hasCommitted &&
         !state.hasEndedQuiz && (
          <button onClick={endQuiz}>end quiz</button>
        )}

        {state.hasEndedQuiz && !state.correct.hasRevealed && (
          <button onClick={revealCorrect}>reveal correct answer and salt</button>
        )}

        {state.correct.salt && state.correct.hasRevealed && (
          <div>
            <span>salt: {state.correct.salt}</span>
            <Copy text={state.correct.salt}/>
            {state.correct.isVerified.salt === undefined && (
              <button onClick={verifySaltCorrect}>verify</button>
            )}
            {state.correct.isVerified.salt === true && (
              <div>✅️</div>
            )}
            {state.correct.isVerified.salt === false && (
              <div>❌️</div>
            )}
          </div>
        )}

        {state.correct.hasRevealed && (
          <div>
            <div>
              <div>correct first answer: {state.correct.guess[0]}</div>
            </div>
            <div>
              <div>correct second answer: {state.correct.guess[1]}</div>
            </div>
            {state.correct.isVerified.guess === undefined && (
              <button onClick={verifyGuessCorrect}>verify</button>
            )}
            {state.correct.isVerified.guess === true && (
              <div>✅️</div>
            )}
            {state.correct.isVerified.guess === false && (
              <div>❌️</div>
            )}
          </div>
        )}

        <br/>

        <div>
          <div className={styles.cards}>
            <div className={styles.options}>
              <a href={`https://mumbai.polygonscan.com/address/${addressAlice}#code`}>Alice</a>
              {state.correct.hasCommitted && !state.alice.hasCommitted && (
                <button onClick={commitAlice}>commit to answers</button>
              )}

              {state.alice.saltHash && (
                <div>
                  <span>salt hash of Alice: {state.alice.saltHash.substring(0, 5)}...</span>
                  <Copy text={state.alice.saltHash}/>
                </div>
              )}

              {state.alice.root && (
                <div>
                  <span>merkle root of Alice: {state.alice.root.substring(0, 5)}...</span>
                  <Copy text={state.alice.root}/>
                </div>
              )}

              {state.alice.hasCommitted && (
                <div>committed</div>
              )}

              {state.hasEndedQuiz && !state.alice.hasRevealed &&  (
                <button onClick={revealAlice}>reveal salt</button>
              )}

              {state.alice.hasRevealed && (
                <div>
                  <span>salt of Alice: {state.alice.salt.substring(0, 5)}...</span>
                  <Copy text={state.alice.alice}/>
                  {state.alice.isVerified.salt === undefined && (
                    <button onClick={verifySaltAlice}>verify</button>
                  )}
                  {state.alice.isVerified.salt === true && (
                    <div>✅️</div>
                  )}
                  {state.alice.isVerified.salt === false && (
                    <div>❌️</div>
                  )}
                </div>
              )}
            </div>
            <div className={styles.options}>
              <a href={`https://mumbai.polygonscan.com/address/${addressBob}#code`}>Bob</a>
              {state.correct.hasCommitted && !state.bob.hasCommitted && (
                <button onClick={commitBob}>commit to answers</button>
              )}

              {state.bob.saltHash && (
                <div>
                  <span>salt hash of Bob: {state.bob.saltHash.substring(0, 5)}...</span>
                  <Copy text={state.bob.saltHash}/>
                </div>
              )}

              {state.bob.root && (
                <div>
                  <span>merkle root of Bob: {state.bob.root.substring(0, 5)}...</span>
                  <Copy text={state.bob.root}/>
                </div>
              )}

              {state.bob.hasCommitted && (
                <div>committed</div>
              )}

              {state.hasEndedQuiz && !state.bob.hasRevealed &&  (
                <button onClick={revealBob}>reveal salt</button>
              )}

              {state.bob.hasRevealed && (
                <div>
                  <span>salt of Bob: {state.bob.salt.substring(0, 5)}...</span>
                  <Copy text={state.bob.salt}/>
                  {state.bob.isVerified.salt === undefined && (
                    <button onClick={verifySaltBob}>verify</button>
                  )}
                  {state.bob.isVerified.salt === true && (
                    <div>✅️</div>
                  )}
                  {state.bob.isVerified.salt === false && (
                    <div>❌️</div>
                  )}
                </div>
              )}
            </div>
            <div className={styles.options}>
              <a href={`https://mumbai.polygonscan.com/address/${addressTony}#code`}>Tony</a>
              {state.correct.hasCommitted && !state.tony.hasCommitted && (
                <button onClick={commitTony}>commit to answers</button>
              )}

              {state.tony.saltHash && (
                <div>
                  <span>salt hash of Tony: {state.tony.saltHash.substring(0, 5)}...</span>
                  <Copy text={state.tony.saltHash}/>
                </div>
              )}

              {state.tony.root && (
                <div>
                  <span>merkle root of Tony: {state.tony.root.substring(0, 5)}...</span>
                  <Copy text={state.tony.root}/>
                </div>
              )}

              {state.tony.hasCommitted && (
                <div>committed</div>
              )}

              {state.hasEndedQuiz && !state.tony.hasRevealed &&  (
                <button onClick={revealTony}>reveal salt</button>
              )}

              {state.tony.hasRevealed && (
                <div>
                  <span>salt of Tony: {state.tony.salt.substring(0, 5)}...</span>
                  <Copy text={state.tony.salt}/>
                  {state.tony.isVerified.salt === undefined && (
                    <button onClick={verifySaltTony}>verify</button>
                  )}
                  {state.tony.isVerified.salt === true && (
                    <div>✅️</div>
                  )}
                  {state.tony.isVerified.salt === false && (
                    <div>❌️</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <br/>

        {state.quiz && state.correct.hasCommitted && (
          <div>
            <div>Question: Yellow long fruit</div>
            <br/>
            <div className={styles.cards}>
              <div>
                {state.alice.hasCommitted ? (
                  <div>
                    <div>{state.alice.guess[0]}</div>
                  </div>
                ) : (
                  <div className={styles.options}>
                    <input type="radio" onChange={guess0Alice} value="tomato" name="alice0" /> Tomato
                    <input type="radio" onChange={guess0Alice} value="banana" name="alice0" /> Banana
                    <input type="radio" onChange={guess0Alice} value="potato" name="alice0" /> Potato
                  </div>
                )}
              </div>
              <div>
                {state.bob.hasCommitted ? (
                  <div>
                    <div>{state.bob.guess[0]}</div>
                  </div>
                ) : (
                  <div className={styles.options}>
                    <input type="radio" onChange={guess0Bob} value="tomato" name="bob0" /> Tomato
                    <input type="radio" onChange={guess0Bob} value="banana" name="bob0" /> Banana
                    <input type="radio" onChange={guess0Bob} value="potato" name="bob0" /> Potato
                  </div>
                )}
              </div>
              <div>
                {state.tony.hasCommitted ? (
                  <div>
                    <div>{state.tony.guess[0]}</div>
                  </div>
                ) : (
                  <div className={styles.options}>
                    <input type="radio" onChange={guess0Tony} value="tomato" name="tony0" /> Tomato
                    <input type="radio" onChange={guess0Tony} value="banana" name="tony0" /> Banana
                    <input type="radio" onChange={guess0Tony} value="potato" name="tony0" /> Potato
                  </div>
                )}
              </div>
            </div>

            <br/>

            <div>Question: Best tool to cut vegetables</div>
            <br/>
            <div className={styles.cards}>
              <div>
                {state.alice.hasCommitted ? (
                  <div>
                    <div>{state.alice.guess[1]}</div>
                    {state.hasEndedQuiz &&
                     state.alice.hasRevealed &&
                     state.alice.isVerified.guess === undefined && (
                      <button onClick={verifyGuessAlice}>verify</button>
                    )}
                    {state.alice.isVerified.guess === true && (
                      <div>✅️</div>
                    )}
                    {state.alice.isVerified.guess === false && (
                      <div>❌️</div>
                    )}
                  </div>
                ) : (
                  <div className={styles.options}>
                    <input type="radio" onChange={guess1Alice} value="knife" name="alice1" /> Knife
                    <input type="radio" onChange={guess1Alice} value="pillow" name="alice1" /> Pillow
                    <input type="radio" onChange={guess1Alice} value="finger" name="alice1" /> Finger
                  </div>
                )}
              </div>
              <div>
                {state.bob.hasCommitted ? (
                  <div>
                    <div>{state.bob.guess[1]}</div>
                    {state.hasEndedQuiz &&
                     state.bob.hasRevealed &&
                     state.bob.isVerified.guess === undefined && (
                      <button onClick={verifyGuessBob}>verify</button>
                    )}
                    {state.bob.isVerified.guess === true && (
                      <div>✅️</div>
                    )}
                    {state.bob.isVerified.guess === false && (
                      <div>❌️</div>
                    )}
                  </div>
                ) : (
                  <div className={styles.options}>
                    <input type="radio" onChange={guess1Bob} value="knife" name="bob1" /> Knife
                    <input type="radio" onChange={guess1Bob} value="pillow" name="bob1" /> Pillow
                    <input type="radio" onChange={guess1Bob} value="finger" name="bob1" /> Finger
                  </div>
                )}
              </div>
              <div>
                {state.tony.hasCommitted ? (
                  <div>
                    <div>{state.tony.guess[1]}</div>
                    {state.hasEndedQuiz &&
                     state.tony.hasRevealed &&
                     state.tony.isVerified.guess === undefined && (
                      <button onClick={verifyGuessTony}>verify</button>
                    )}
                    {state.tony.isVerified.guess === true && (
                      <div>✅️</div>
                    )}
                    {state.tony.isVerified.guess === false && (
                      <div>❌️</div>
                    )}
                  </div>
                ) : (
                  <div className={styles.options}>
                    <input type="radio" onChange={guess1Tony} value="knife" name="tony1" /> Knife
                    <input type="radio" onChange={guess1Tony} value="pillow" name="tony1" /> Pillow
                    <input type="radio" onChange={guess1Tony} value="finger" name="tony1" /> Finger
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {state.isLoading ? <LoadingIndicator key={state.isLoading} /> : null}
      </main>
    </>
  );
}

function LoadingIndicator() {
    const [time, setTime] = React.useState(0)
    React.useEffect(() => {
        const startTime = Date.now()
        const interval = setInterval(() => {
            setTime(Date.now() - startTime)
        }, 16)
        return () => clearInterval(interval)
    }, [])
    return (
        <div className="loading">
            <div className="lds-ellipsis">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
            {time > 200 && (
                <div className="time">{(time / 1000).toFixed(2)}s</div>
            )}
        </div>
    )
}

function Copy({text}) {
  return (
    <button onClick={() => navigator.clipboard.writeText(text)}>
      <img src={CopyIcon} alt="copy to clipboard" />
    </button>
  )
}
