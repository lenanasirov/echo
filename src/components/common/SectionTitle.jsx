function SectionTitle ({ title, description}) {
    return (
        <div className="mx-auto max-w-2xl text-center">

            <h2 className="
                text-4xl
                font-bold
                tracking-tight
            ">
                {title}
            </h2>


            <p className="
                mt-4
                text-zinc-400
                text-lg
            ">
                {description}
            </p>

        </div>
    );
}

export default SectionTitle;