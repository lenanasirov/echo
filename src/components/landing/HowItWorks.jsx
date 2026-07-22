import SectionTitle from "../common/SectionTitle";
import StepCard from "./StepCard";
import {
    FiMusic,
    FiCamera,
    FiHeart
} from "react-icons/fi";

const steps = [
    {
        number: "01",
        icon: FiMusic,
        title: "Choose a song",
        description:
            "Pick the song that represents how you feel in this moment."
    },
    
    {
        number: "02",
        icon: FiCamera,
        title: "Capture a moment",
        description:
            "Add a photo and a thought that preserves the memory."
    },

    {
        number: "03",
        icon: FiHeart,
        title: "Share your memory",
        description:
            "Connect with friends through authentic moments and emotions."
    }    
];

function HowItWorks () {
    return (
        <section className="px-8 py-24">

            <SectionTitle
                title="How Echo works"
                description="Turn everyday experiences into memories with a soundtrack."
            />

            <div
                className="
                    relative
                    mx-auto
                    mt-16
                    grid
                    max-w-5xl
                    gap-12
                    md:grid-cols-3
                "
            >

                {/* Connecting line */}
                <div
                className="
                    hidden
                    absolute
                    top-10
                    left-[16%]
                    right-[16%]
                    h-px
                    bg-white/10
                    md:block
                    z-0
                "
                />
                
                {steps.map((step) => (
                    <div
                        key={step.number}
                        className="relative z-10"
                    >
                        <StepCard {...step} />
                    </div>
                ))}
                
            </div>

        </section>
    );
}

export default HowItWorks;