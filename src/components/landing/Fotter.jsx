import { motion } from "framer-motion";
import {
    FiInstagram,
    FiGithub,
    FiTwitter
} from "react-icons/fi";

function Footer() {
    return (
        <motion.footer
            initial={{
                opacity: 0,
                y: 30
            }}

            whileInView={{
                opacity: 1,
                y: 0
            }}

            viewport={{
                once:true
            }}

            transition={{
                duration:0.6
            }}

            className="
                relative
                overflow-hidden
                border-t
                border-white/10
                px-8
                py-16
            "
        >
            {/* Background glow */}
            <div
                className="
                    absolute
                    bottom-0
                    left-1/2
                    h-72
                    w-72
                    -translate-x-1/2
                    rounded-full
                    bg-purple-600/10
                    blur-3xl
                "
            />

            {/* Footer content */}
            <div
                className="
                    relative 
                    mx-auto
                    max-w-6xl
                "
            >

                <div
                    className="
                        grid
                        gap-10
                        md:grid-cols-4
                    "
                >

                    {/* Brand */}
                    <div>

                        <h3
                            className="
                                bg-gradient-to-r
                                from-purple-400
                                to-pink-400
                                bg-clip-text
                                text-3xl
                                font-bold
                                text-transparent
                            "
                        >
                            Echo
                        </h3>


                        <p
                            className="
                                mt-3
                                max-w-xs
                                text-zinc-400
                            "
                        >
                            Moments, music, and memories
                            connected together.
                        </p>

                    </div>


                    {/* Product */}
                    <div>

                        <h4
                            className="
                                font-semibold
                            "
                        >
                            Product
                        </h4>


                        <ul
                            className="
                                mt-4
                                space-y-3
                                text-zinc-400
                            "
                        >
                            <li className="footer-link">
                                Features
                            </li>

                            <li className="footer-link">
                                How it works
                            </li>

                            <li className="footer-link">
                                Memories
                            </li>
                        </ul>

                    </div>


                    {/* Company */}
                    <div>

                        <h4
                            className="
                                font-semibold
                            "
                        >
                            Company
                        </h4>


                        <ul
                            className="
                                mt-4
                                space-y-3
                                text-zinc-400
                            "
                        >
                            <li className="footer-link">
                                About
                            </li>

                            <li className="footer-link">
                                Contact
                            </li>

                            <li className="footer-link">
                                Careers
                            </li>
                        </ul>

                    </div>


                    {/* Social */}
                    <div>

                        <h4
                            className="
                                font-semibold
                            "
                        >
                            Follow
                        </h4>


                        <ul
                            className="
                                mt-4
                                space-y-3       
                            "
                        >
                            <li>
                                {/* TODO: Replace # with real Echo social URLs when accounts are created */}
                                <a href="#" className="footer-link flex items-center gap-2">
                                    <FiInstagram />
                                    Instagram
                                </a>
                            </li>

                            <li >
                                <a href="#" className="footer-link flex items-center gap-2">
                                    <FiGithub />
                                    GitHub
                                </a>
                            </li>

                            <li >
                                <a href="#" className="footer-link flex items-center gap-2">
                                    <FiTwitter />
                                    Twitter
                                </a>
                            </li>
                        </ul>

                    </div>

                </div>


                {/* Bottom */}
                <div
                    className="
                        mt-12
                        border-t
                        border-white/10
                        pt-6
                        flex
                        flex-col
                        gap-3
                        text-sm
                        text-zinc-500
                        sm:flex-row
                        sm:justify-between
                    "
                >

                        <span>
                            © 2026 Echo. All rights reserved.
                        </span>


                        <span>
                            Made with 💜 and music.
                        </span>

                </div>

            </div>

        </motion.footer>
    );
}

export default Footer;