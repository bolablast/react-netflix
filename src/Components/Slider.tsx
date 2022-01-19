import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import { clickedIndexState, clickedPopularIndexState } from "../atoms";
//import { IGetMoviesResult } from "../api";
import { makeImagePath } from "../utils";

const offset = 6;

const Slider = styled.div`
  position: relative;
  top: -100px;
`;

const SliderArrow = styled(motion.div)`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  top: 150px;
  font-size: 30px;
  color: red;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.5s linear;
  &:hover {
    background-color: black;
  }
`;

const ListTitle = styled.h1`
  font-size: 30px;
  margin-bottom: 20px;
  font-weight: 600;
  margin-left: 20px;
`;

const Row = styled(motion.div)`
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(6, 1fr);
  position: absolute;
  width: 100%;
`;

const Box = styled(motion.div)<{ bgphoto: string }>`
  background-color: white;
  background-image: url(${(props) => props.bgphoto});
  height: 200px;
  color: red;
  font-size: 66px;
  background-size: cover;
  background-position: center;
  position: relative;
  &:first-child {
    transform-origin: center left !important;
  }
  &:last-child {
    transform-origin: center right !important;
  }
`;

const Info = styled(motion.div)`
  padding: 20px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 18px;
    color: white;
  }
`;

const boxVariants = {
  normal: {
    scale: 1,
  },
  hover: {
    scale: 1.3,
    y: -50,
    zIndex: 99,
    transition: {
      delay: 0.5,
      duration: 0.3,
      type: "tween",
    },
  },
};

const infoVariants = {
  hover: {
    opacity: 1,
    transition: {
      delay: 0.5,
      duration: 0.3,
      type: "tween",
    },
  },
};

const rowVariants = {
  visible: {
    x: 0,
  },
  exit: (isBack: boolean) => {
    return {
      x: isBack ? window.innerWidth : -window.innerWidth,
    };
  },
  hidden: (isBack: boolean) => {
    return {
      x: isBack ? -window.innerWidth : window.innerWidth,
    };
  },
};

function SliderComponent({ data, position, section, title }: any) {
  const [back, setBack] = useState(false);
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [sliderMouse, setSlierMouse] = useState(false);
  const [clickIndex, setClickIndex] = useRecoilState(clickedIndexState);
  const [clickPopularIndex, setClickPopularIndex] = useRecoilState(
    clickedPopularIndexState
  );
  const navigate = useNavigate();
  const onMouseLeave = () => {
    setSlierMouse(false);
  };
  const onMouseOver = () => {
    setSlierMouse(true);
  };
  const increaseIndex = (direction: string) => {
    if (data) {
      if (leaving) return;
      toggleLeaving();
      const totalMovies = data?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      if (direction === "left") {
        setBack(true);
        setIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
      } else {
        setBack(false);
        setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
      }
    }
  };
  const toggleLeaving = () => setLeaving((prev) => !prev);
  const onBoxClicked = (movieId: string) => {
    navigate(`/movie/${movieId}`);
  };
  console.log("clickIndex", clickIndex);
  console.log("clickPopularIndex", clickPopularIndex);
  return (
    <Slider
      style={{ top: position ? position : null }}
      onMouseLeave={onMouseLeave}
      onMouseOver={onMouseOver}
    >
      {sliderMouse ? (
        <SliderArrow
          onClick={() => increaseIndex("left")}
          style={{ left: "20px" }}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </SliderArrow>
      ) : null}
      <AnimatePresence
        custom={back}
        initial={false}
        onExitComplete={toggleLeaving}
      >
        <ListTitle>{title}</ListTitle>
        <Row
          custom={back}
          variants={rowVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          key={index}
          transition={{ type: "tween", duration: 1 }}
        >
          {data?.results
            .slice(1)
            .slice(offset * index, offset * index + offset)
            .map((movie: any, index: any) => (
              <Box
                layoutId={
                  section
                    ? section === "popularity"
                      ? movie.popularity + ""
                      : movie.vote_count + ""
                    : movie.id + ""
                }
                variants={boxVariants}
                whileHover="hover"
                initial="normal"
                onClick={() => {
                  if (section === "popularity") {
                    onBoxClicked(String(movie.popularity));
                    setClickPopularIndex(index);
                    setClickIndex(-1);
                  } else {
                    onBoxClicked(String(movie.id));
                    setClickIndex(index);
                    setClickPopularIndex(-1);
                  }
                }}
                style={{
                  opacity:
                    section === "popularity"
                      ? clickPopularIndex + "" === index + ""
                        ? 0
                        : 1
                      : clickIndex === index
                      ? 0
                      : 1,
                }}
                key={movie.id}
                transition={{
                  type: "tween",
                }}
                bgphoto={makeImagePath(movie.backdrop_path, "w500")}
              >
                <Info variants={infoVariants}>
                  <h4>{movie.title}</h4>
                </Info>
              </Box>
            ))}
        </Row>
      </AnimatePresence>
      {sliderMouse ? (
        <SliderArrow
          onClick={() => {
            increaseIndex("right");
          }}
          style={{ right: "20px" }}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </SliderArrow>
      ) : null}
    </Slider>
  );
}

export default React.memo(SliderComponent);
