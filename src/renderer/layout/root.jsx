import React, { useState, useEffect } from 'react';
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
import artifactKasner from 'kasner/artifacts/Kasner.sol/Kasner.json';

export function Root() {
  return (
    <Router>
      <Routes>
        <Route index element={<Page />} />
      </Routes>
    </Router>
  );
}

function Page() {

  return (
    <>
      <main className={styles.main}>
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
