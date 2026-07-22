import SectionTitle from "../common/SectionTitle";
import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: "🎵",
    title: "Music remembers",
    description:
      "Every song carries a story. Connect your favorite tracks with the moments they represent."
  },

  {
    icon: "📸",
    title: "Capture the real",
    description:
      "Share authentic moments instead of creating a perfect online version of yourself."
  },

  {
    icon: "💜",
    title: "Feel connected",
    description:
      "Discover the emotions and memories behind the music your friends share."
  }
];


function WhyEcho() {
    return (
        <section
            id="why-echo"
            className="
                py-24
                px-8
            "
        >

            <SectionTitle
                title="Why Echo?"
                description="A different way to remember and share the moments that matter."
            />

            <div className="
                mx-auto
                mt-12
                grid
                max-w-6xl
                gap-8
                md:grid-cols-3
            ">
                {features.map((feature) => (
                    <FeatureCard key={feature.title} {...feature} />
                ))}
            </div>

        </section>
    );
}

export default WhyEcho;