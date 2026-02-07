import { Link } from "react-router-dom";
import stockBackdrop from "/stockBackdrop.png";
import Button from "../components/Button";

export default function LandingPage() {
  return (
    <section
      style={{
        backgroundImage: `url(${stockBackdrop})`,
      }}
    >
      <div className="container">
        <h1 className="display text-marketpulse-radial text-center margin-top-small">
          Name
        </h1>
        <h2 className="body-strong m-1 text-lg text-center">
          Trade markets, read news, build your watchlist in one place.{" "}
        </h2>
        <h3 className="text-muted text-center">
          Stay on top of your trades with an AI powered assistant
        </h3>
        <div className="align-center flex m-7">
          <Button>Analyse Your Next Trade</Button>
        </div>
      </div>
    </section>
  );
}
