import { useQuery } from "react-query";
import styled from "styled-components";
import { getMovies, IGetMoviesResult } from "../api";
import { AnimatePresence, motion, useViewportScroll } from "framer-motion";
import { makeImagePath } from "../utils";
import { useEffect, useState } from "react";
import { useMatch, useNavigate } from "react-router";

const Wrapper = styled.div`
  background-color: black;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Banner = styled(motion.div)<{ bgphoto: string }>`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
    url(${(props) => props.bgphoto});
  background-size: cover;
`;

const Title = styled.h2`
  font-size: 68px;
  margin-bottom: 20px;
`;

const Overview = styled.p`
  font-size: 36px;
  width: 50%;
`;

const Slider = styled.div`
  position: relative;
  top: -100px;
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

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  z-index: 100;
`;

const BigMovie = styled(motion.div)`
  position: absolute;
  width: 40vw;
  height: 80vh;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-radius: 50px;
  overflow: hidden;
  background-color: ${(props) => props.theme.black.lighter};
  z-index: 102;
`;

const BigCover = styled.div`
  width: 100%;
  background-size: cover;
  background-position: center center;

  height: 500px;
`;

const BigTitle = styled.h3`
  position: relative;
  top: -60px;
  padding: 10px;
  text-align: center;
  font-size: 46px;
  color: ${(props) => props.theme.white.lighter};
`;
const offset = 6;

const BigOverview = styled.p`
  padding: 20px;
  position: relative;
  color: ${(props) => props.theme.white.lighter};
  top: -80px;
`;

const SliderArrow = styled(motion.div)`
  position: absolute;
  display: inline-block;
  z-index: 100;
  top: 90px;
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

function Home() {
  const [back, setBack] = useState(false);
  const navigate = useNavigate();
  const bigMovieMatch = useMatch("/movie/:movieId");
  const { scrollY } = useViewportScroll();
  const [clickIndex, setClickIndex] = useState(-1);
  const onOverlayClick = () => {
    navigate("/");
    setClickIndex(-1);
  };
  const { data, isLoading } = useQuery<IGetMoviesResult>(
    ["movies", "nowPlaying"],
    getMovies
  );
  const [sliderMouse, setSlierMouse] = useState(false);
  const onMouseEnter = () => {
    setSlierMouse(true);
  };
  const onMouseLeave = () => {
    setSlierMouse(false);
  };
  console.log(sliderMouse);
  const [mainData, setMainData] = useState() as any;
  useEffect(() => {
    const timer = setInterval(() => {
      setMainData(
        data?.results[Math.floor(Math.random() * data?.results.length)]
      );
    }, 30000); // Time to change the screen.
    setInterval(() => {
      clearTimeout(timer);
    }, 30000); // Time to change the screen.
  }, [data, mainData]);
  const clickedMovie =
    bigMovieMatch?.params.movieId &&
    data?.results.find(
      (movie) => movie.id + "" === bigMovieMatch.params.movieId
    );
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
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
  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <AnimatePresence>
            <Banner
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1,
              }}
              bgphoto={makeImagePath(
                mainData
                  ? mainData?.backdrop_path
                  : data?.results[0].backdrop_path || ""
              )}
            >
              <Title>
                {mainData ? mainData?.title : data?.results[0].title}
              </Title>
              <Overview>
                {mainData ? mainData?.overview : data?.results[0].overview}
              </Overview>
            </Banner>
          </AnimatePresence>
          <Slider onMouseLeave={onMouseLeave} onMouseEnter={onMouseEnter}>
            {sliderMouse ? (
              <SliderArrow
                onClick={() => increaseIndex("right")}
                style={{ left: "20px" }}
              >
                {"<"}
              </SliderArrow>
            ) : null}
            <AnimatePresence
              custom={back}
              initial={false}
              onExitComplete={toggleLeaving}
            >
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
                  .map((movie, index) => {
                    if (index === clickIndex) {
                      return (
                        <Box
                          layoutId={movie.id + ""}
                          variants={boxVariants}
                          whileHover="hover"
                          initial="normal"
                          onClick={() => {
                            onBoxClicked(String(movie.id));
                            setClickIndex(index);
                          }}
                          key={movie.id}
                          transition={{
                            type: "tween",
                          }}
                          style={{ opacity: 0 }}
                          bgphoto={makeImagePath(movie.backdrop_path, "w500")}
                        >
                          <Info variants={infoVariants}>
                            <h4>{movie.title}</h4>
                          </Info>
                        </Box>
                      );
                    } else {
                      return (
                        <Box
                          layoutId={movie.id + ""}
                          variants={boxVariants}
                          whileHover="hover"
                          initial="normal"
                          onClick={() => {
                            onBoxClicked(String(movie.id));
                            setClickIndex(index);
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
                      );
                    }
                  })}
              </Row>
            </AnimatePresence>
            {sliderMouse ? (
              <SliderArrow
                onClick={() => increaseIndex("right")}
                style={{ right: "20px" }}
              >
                {">"}
              </SliderArrow>
            ) : null}
          </Slider>
          <AnimatePresence>
            {bigMovieMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  exit={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
                <BigMovie
                  style={{
                    top: scrollY.get() + 100,
                  }}
                  layoutId={bigMovieMatch.params.movieId}
                >
                  {clickedMovie && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top,black,transparent),url(${makeImagePath(
                            clickedMovie.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      />
                      <BigTitle>{clickedMovie.title}</BigTitle>
                      <BigOverview>{clickedMovie.overview}</BigOverview>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Home;
