import { useState, useEffect } from "react";
import Spinner from "../spinner/Spinner";
import ErrorMessage from "../errorMessage/ErrorMessage";
import useMarvelService from "../../services/MarvelService";

import "./randomChar.scss";
import mjolnir from "../../resources/img/mjolnir.png";

const RandomChar = () => {
  const [char, setChar] = useState(null);
  const { loading, error, getRandomCharacter, clearError } = useMarvelService();

  useEffect(() => {
    updateChar();
    const timerId = setInterval(updateChar, 60000);

    return () => {
      clearInterval(timerId);
    };
    // Mount only: `updateChar` is recreated on every render, so depending on
    // it would restart the interval endlessly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCharLoaded = (char) => {
    setChar(char);
  };

  const updateChar = () => {
    clearError();
    // The old version guessed an id inside a hard-coded range and hoped it
    // existed; the dataset is loaded once, so a random pick is exact.
    getRandomCharacter().then(onCharLoaded);
  };

  const errorMessage = error ? <ErrorMessage /> : null;
  const spinner = loading ? <Spinner /> : null;
  const content = !(loading || error || !char) ? <View char={char} /> : null;

  return (
    <div className="randomchar">
      {errorMessage}
      {spinner}
      {content}
      <div className="randomchar__static">
        <p className="randomchar__title">
          Random character for today!
          <br />
          Do you want to get to know him better?
        </p>
        <p className="randomchar__title">Or choose another one</p>
        <button onClick={updateChar} className="button button__main">
          <div className="inner">try it</div>
        </button>
        <img src={mjolnir} alt="mjolnir" className="randomchar__decoration" />
      </div>
    </div>
  );
};

const View = ({ char }) => {
  const { name, description, thumbnail, homepage, wiki } = char;

  return (
    <div className="randomchar__block">
      <img
        src={thumbnail}
        alt={name}
        className="randomchar__img"
        style={{ objectFit: "cover" }}
      />
      <div className="randomchar__info">
        <p className="randomchar__name">{name}</p>
        <p className="randomchar__descr">{description}</p>
        <div className="randomchar__btns">
          <a
            href={homepage}
            target="_blank"
            rel="noreferrer"
            className="button button__main"
          >
            <div className="inner">marvel.com</div>
          </a>
          <a
            href={wiki}
            target="_blank"
            rel="noreferrer"
            className="button button__secondary"
          >
            <div className="inner">Wiki</div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default RandomChar;
