import SectionTitle from "../common/SectionTitle";
import PhoneMockup from "./PhoneMockup";

function AppPreview() {
    return (
        <section 
            className="
                relative
                overflow-hidden
                px-8
                py-28
            "
        >
            <div
                className="
                    absolute
                    left-1/2
                    top-1/2
                    h-96
                    w-96
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-purple-600/20
                    blur-3xl
                "
            />

            <SectionTitle
                title="See Echo in action"
                description="A glimpse into how your memories come to life."
            />

            <div
                className="
                    mx-auto
                    mt-16
                    flex
                    max-w-7xl
                    flex-wrap
                    justify-center
                    gap-10
                "
            >

                <PhoneMockup type="memory" title="Your Memories" delay={0} />

                <PhoneMockup type="timeline" title="Memory Timeline" delay={0.7} />

                <PhoneMockup type="friends" title="Friends Feed" delay={1.4} />

            </div>

        </section>
    );
}

export default AppPreview;