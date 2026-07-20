import Button from "../common/Button";


function Hero() {
  return (
    <section className="
      relative
      flex
      min-h-[80vh]
      items-center
      overflow-hidden
      px-8
    ">

      <div className="
        mx-auto
        grid
        max-w-7xl
        grid-cols-1
        gap-12
        md:grid-cols-2
        items-center
      ">

        {/* Text Side */}
        <div>

          <h1 className="
            text-5xl
            font-bold
            leading-tight
            md:text-7xl
          ">
            Every moment
            <br />
            has a soundtrack.
          </h1>


          <p className="
            mt-6
            max-w-lg
            text-lg
            text-zinc-400
          ">
            Capture your memories through music,
            photos, and emotions.
          </p>


          <div className="mt-8">
            <Button>
              Start Echoing
            </Button>
          </div>

        </div>


        {/* Preview Side */}
        <div className="
          flex
          justify-center
        ">

          <MomentPreview />

        </div>


      </div>

    </section>
  );
}


function MomentPreview() {

  return (
    <div className="
      w-80
      rounded-3xl
      bg-[#15151D]
      p-5
      shadow-2xl
    ">

      <div className="
        h-64
        rounded-2xl
        bg-gradient-to-br
        from-purple-500
        to-pink-500
        flex
        items-center
        justify-center
        text-6xl
      ">
        📸
      </div>


      <div className="mt-5">

        <h3 className="text-xl font-semibold">
          Space Song
        </h3>

        <p className="text-zinc-400">
          Beach House
        </p>


        <div className="
          mt-4
          flex
          justify-between
          text-sm
        ">

          <span>
            🌙 Nostalgic
          </span>

          <span>
            ❤️ 12
          </span>

        </div>

      </div>

    </div>
  );
}


export default Hero;