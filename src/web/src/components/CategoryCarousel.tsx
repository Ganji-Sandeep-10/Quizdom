import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// simple list of categories with short descriptions
const categories = [
    { title: 'Science', desc: 'Experiments, discoveries & theories' },
    { title: 'Math', desc: 'Numbers, formulas & logic' },
    { title: 'History', desc: 'Events and people from the past' },
    { title: 'Geography', desc: 'Countries, maps & landscapes' },
    { title: 'Art', desc: 'Paintings, sculpture & design' },
    { title: 'Literature', desc: 'Books, poems & authors' },
    { title: 'Sports', desc: 'Games, athletes & records' },
    { title: 'Music', desc: 'Songs, composers & genres' },
    { title: 'Technology', desc: 'Gadgets, coding & innovation' },
];

// this carousel automatically scrolls through the category cards forever
export default function CategoryCarousel() {
    const base = categories.length;
    // triple the array to allow seamless looping
    const slides = [...categories, ...categories, ...categories];

    const [position, setPosition] = useState(base);
    const [resetting, setResetting] = useState(false);

    // width of a single slide (including gap) so we can calculate the translate
    const carouselRef = useRef<HTMLDivElement>(null);
    const [slideWidth, setSlideWidth] = useState(0);

    useEffect(() => {
        if (carouselRef.current) {
            const first = carouselRef.current.querySelector('div');
            if (first instanceof HTMLElement) {
                const rect = first.getBoundingClientRect();
                // gap is defined on the flex container, not the item
                const parentStyle = window.getComputedStyle(carouselRef.current);
                const gap = parseFloat(parentStyle.gap) || 0;
                setSlideWidth(rect.width + gap);
            }
        }
    }, []);

    // advance one card every 2 seconds
    useEffect(() => {
        const id = setInterval(() => {
            setPosition(p => p + 1);
        }, 2000);

        return () => clearInterval(id);
    }, []);

    // when we hit the artificial boundary, jump back into the middle copy
    // when slideWidth becomes available we may need to snap to the starting offset
    useEffect(() => {
        if (slideWidth && position === base) {
            // trigger a quick reset so that the x value jumps to the middle copy without animation
            setResetting(true);
            requestAnimationFrame(() => setResetting(false));
        }
    }, [slideWidth, base, position]);

    // when we hit the artificial boundary, jump back into the middle copy
    useEffect(() => {
        if (slideWidth === 0) {
            return;
        }

        if (position === base * 2 || position === base - 1) {
            setResetting(true);
            const target = base + (position % base);
            // reset synchronously on next tick to avoid any visible blip
            requestAnimationFrame(() => {
                setPosition(target);
                setResetting(false);
            });
            // no cleanup necessary
        }
    }, [position, base, slideWidth]);

    // only show 4 or 5 cards at once using flex wrap; each card has fixed width
    return (
        <div className="relative w-full overflow-hidden py-8 border border-gray-200 rounded-lg">
            <motion.div
                ref={carouselRef}
                className="flex gap-4"
                animate={{ x: slideWidth ? `-${position * slideWidth}px` : 0 }}
                transition={
                    resetting
                        ? { type: 'tween', duration: 0 }
                        : { type: 'spring', stiffness: 120, damping: 20 }
                }
            >
                {slides.map((cat, idx) => (
                    <div
                        key={`${cat.title}-${idx}`}
                        className="flex-shrink-0 "
                    >
                        <div className="w-48 h-28 bg-gray-100 rounded-lg p-4 flex flex-col justify-center">
                            <h3 className="text-lg font-semibold mb-1 text-center">{cat.title}</h3>
                            <p className="text-xs text-gray-600 text-center">{cat.desc}</p>
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
