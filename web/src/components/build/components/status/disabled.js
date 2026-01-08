export const disabledSvg = () => {
    return (
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <ellipse cx="256" cy="256" rx="210" ry="210" fill="none" stroke="var(--text-color-secondary)" stroke-linecap="round" stroke-miterlimit="10" stroke-width="36"></ellipse>
            <ellipse cx="256" cy="256" rx="100" ry="100" fill="none" stroke="var(--text-color-secondary)" stroke-linecap="round" stroke-miterlimit="10" stroke-width="36"></ellipse>
            <path fill="none" stroke="var(--text-color-secondary)" stroke-linecap="round" stroke-linejoin="round" stroke-width="36" d="M192 320l128-128"></path>
        </svg>
    )
}