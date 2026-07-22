import Button from "../common/Button";
import { motion } from "framer-motion";
import MomentCard from "../moment/MomentCard";

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
            absolute
            left-20
            top-20
            h-72
            w-72
            rounded-full
            bg-purple-600/20
            blur-3xl
        "/>

        <div className="
            absolute
            bottom-10
            right-20
            h-80
            w-80
            rounded-full
            bg-pink-500/20
            blur-3xl
        "/>

      <div className="
        relative
        z-10
        mx-auto
        grid
        max-w-7xl
        grid-cols-1
        gap-12
        md:grid-cols-2
        items-center
      ">

        {/* Text Side */}
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.8
            }}
        >

          <h1 className="
            text-5xl
            md:text-7xl
            font-extrabold
            leading-tight
            tracking-tight
          ">
            Every moment
            <br />
            <span className="
                bg-gradient-to-r
                from-purple-400
                to-pink-400
                bg-clip-text
                text-transparent
            ">
                has a soundtrack.
            </span>

          </h1>


          <p className="
            mt-6
            max-w-lg
            text-lg
            text-zinc-400
          ">
            Turn everyday moments into lasting memories through music, emotion, and photography.
          </p>


          <div className="mt-8 flex items-center gap-6">
            <Button>
              Start Echoing
            </Button>

            <a
            href="#why-echo"
            className="
                font-medium
                text-zinc-400
                transition-colors
                duration-300
                hover:text-white
            "
            >
            Learn More →
            </a>
          </div>

        </motion.div>


        {/* Preview Side */}
        <motion.div className="
            flex
            justify-center
            "
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                delay: 0.2,
                duration: 0.8
            }}
        >

          <MomentCard />

        </motion.div>


      </div>

    </section>
  );
}

export default Hero;