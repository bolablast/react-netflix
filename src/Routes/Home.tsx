import { useQuery } from "react-query";
import styled from "styled-components";
import { getMovies, getPopularMovies, IGetMoviesResult } from "../api";
import { AnimatePresence, motion, useViewportScroll } from "framer-motion";
import { makeImagePath } from "../utils";
import { useEffect, useState } from "react";
import { useMatch, useNavigate } from "react-router";
import SliderComponent from "../Components/Slider";
import { useSetRecoilState } from "recoil";
import { clickedIndexState, clickedPopularIndexState } from "../atoms";

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

const BigOverview = styled.p`
  padding: 20px;
  position: relative;
  color: ${(props) => props.theme.white.lighter};
  top: -80px;
`;

function Home() {
  const navigate = useNavigate();
  const bigMovieMatch = useMatch("/movie/:movieId");
  const { scrollY } = useViewportScroll();
  const setClickIndex = useSetRecoilState(clickedIndexState);
  const setClickPopularIndex = useSetRecoilState(clickedPopularIndexState);
  const onOverlayClick = () => {
    navigate("/");
    setClickIndex(-1);
    setClickPopularIndex(-1);
  };
  const { data, isLoading } = useQuery<IGetMoviesResult>(
    ["movies", "nowPlaying"],
    getMovies
  );
  const { data: popularMovieData } = useQuery<IGetMoviesResult>(
    ["movies", "popular"],
    getPopularMovies
  );
  const [mainData, setMainData] = useState() as any;
  useEffect(() => {
    const timer = setInterval(() => {
      setMainData(
        data?.results[Math.floor(Math.random() * data?.results.length)]
      );
    }, 60000); // Time to change the screen.
    setInterval(() => {
      clearTimeout(timer);
    }, 60000); // Time to change the screen.
  }, [mainData, data]);
  const clickedMovie =
    bigMovieMatch?.params.movieId &&
    data?.results.find(
      (movie) => movie.id + "" === bigMovieMatch.params.movieId
    );
  const clickedPopularMovie =
    bigMovieMatch?.params.movieId &&
    popularMovieData?.results.find(
      (movie) => movie.popularity + "" === bigMovieMatch.params.movieId
    );
  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <AnimatePresence>
            <Banner
              key={mainData ? mainData.id : data?.results[0].id}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: {
                  duration: 2,
                },
              }}
              exit={{ opacity: 0 }}
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
          <SliderComponent title="현재 상영 중" data={data} />
          <SliderComponent
            title="인기 있는 영화"
            data={popularMovieData}
            position="150px"
            section="popularity"
          />
          <AnimatePresence>
            {bigMovieMatch ? (
              <>
                <Overlay
                  onClick={() => onOverlayClick()}
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
                  {clickedPopularMovie && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top,black,transparent),url(${makeImagePath(
                            clickedPopularMovie.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      />
                      <BigTitle>{clickedPopularMovie.title}</BigTitle>
                      <BigOverview>{clickedPopularMovie.overview}</BigOverview>
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
