import { useState, useEffect } from "react";
import PropTypes from "prop-types";

import useMarvelService from "../../services/MarvelService";
import Spinner from "../spinner/Spinner";
import ErrorMessage from "../errorMessage/ErrorMessage";
import Skeleton from "../skeleton/Skeleton";

import "./charInfo.scss";

const CharInfo = (props) => {
  const [char, setChar] = useState(null);

  const { loading, error, getCharacter, clearError } = useMarvelService();

  useEffect(() => {
    // Refetch when the selected character changes. `updateChar` is recreated
    // on every render, so depending on it would fetch in a loop.
    updateChar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.charId]);

  const updateChar = () => {
    const { charId } = props;
    if (!charId) {
      return;
    }

    clearError();
    getCharacter(charId).then(onCharLoaded);
  };

  const onCharLoaded = (char) => {
    setChar(char);
  };

  const skeleton = char || loading || error ? null : <Skeleton />;
  const errorMessage = error ? <ErrorMessage /> : null;
  const spinner = loading ? <Spinner /> : null;
  const content = !(loading || error || !char) ? <View char={char} /> : null;

  return (
    <div className="char__info">
      {skeleton}
      {errorMessage}
      {spinner}
      {content}
    </div>
  );
};

const View = ({ char }) => {
  const { name, description, thumbnail, homepage, wiki, powerstats, alignment } =
    char;

  return (
    <>
      <div className="char__basics">
        <img src={thumbnail} alt={name} style={{ objectFit: "cover" }} />
        <div>
          <div className="char__info-name">{name}</div>
          {alignment && (
            <div className={`char__align char__align_${alignment}`}>
              {alignment}
            </div>
          )}
          <div className="char__btns">
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
      <div className="char__descr">{description}</div>

      {/* The old build listed the character's comics; this dataset carries
          power stats instead, which say more in the same space. */}
      <div className="char__comics">Power stats:</div>
      <ul className="char__stats">
        {powerstats.length === 0 && "No power stats for this character"}
        {powerstats.map(({ name: stat, value }) => (
          <li key={stat} className="char__stats-item">
            <span className="char__stats-name">{stat}</span>
            <span className="char__stats-track">
              <span className="char__stats-fill" style={{ width: `${value}%` }} />
            </span>
            <span className="char__stats-value">{value}</span>
          </li>
        ))}
      </ul>
    </>
  );
};

CharInfo.propTypes = {
  charId: PropTypes.number,
};

export default CharInfo;
