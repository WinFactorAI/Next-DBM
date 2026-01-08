

export const builtProgressSvg = () => {
    return (
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <ellipse opacity="0.4" cx="256" cy="256" rx="210" ry="210" fill="none" stroke="var(--blue)" stroke-linecap="round" stroke-miterlimit="10" stroke-width="36"></ellipse>
            <path d="M256 46C140.02 46 46 140.02 46 256" fill="transparent" stroke="var(--blue)" stroke-width="36" stroke-miterlimit="10" stroke-linecap="round" data-symbol-animation="spin"></path>
            <circle cx="256" cy="256" r="30" fill="var(--blue)"></circle>
            <circle cx="352" cy="256" r="30" fill="var(--blue)"></circle>
            <circle cx="160" cy="256" r="30" fill="var(--blue)"></circle>
        </svg>

    )
}