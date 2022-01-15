export function makeImagePath(id: string, format?: string) {
  if (id === "") {
    return "https://st3.depositphotos.com/23594922/31822/v/600/depositphotos_318221368-stock-illustration-missing-picture-page-for-website.jpg";
  } else {
    return `https://image.tmdb.org/t/p/${format ? format : "original"}/${id}`;
  }
}
