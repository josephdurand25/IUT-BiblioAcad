import clsx from "clsx";
import { Spinner } from "./Spinner";
interface Props {
    size?: "small" | "medium" | "large";
    variant?:
        | "accent"
        | "slate"
        | "secondary"
        | "outline"
        | "disabled"
        | "ico"
        | "danger"
        | "success"
        | "sivathemedark"
        | "perso" // c'est pour que seul les style supplémentaire soient pris en comptes
        | "sivatheme";
    icon?: string;
    iconTheme?: "accent" | "secondary" | "gray";
    iconPosition?: "left" | "right";
    disabled?: boolean;
    isLoading?: boolean;
    children?: React.ReactNode;
    baseUrl?: string;
    linkType?: "internal" | "external";
    action?: Function;
    type?: "button" | "submit";
    fullWidth?: boolean;
    supStyle?: string;
    [key: string]: any; // Permet d'accepter tous les autres props
}

export const Button = ({
    size = "small",
    variant = "accent",
    icon,
    iconTheme = "accent",
    iconPosition = "right",
    disabled,
    isLoading,
    children,
    baseUrl,
    linkType = "internal",
    action = () => {},
    type = "button",
    fullWidth = false,
    supStyle,
    ...rest // Capture tous les autres props non déstructurés
}: Props) => {
    let variantStyles: string = "",
        sizeStyles: string = "",
        icoSize: number = 0;

    switch (variant) {
        case "accent":
            variantStyles = "bg-blue-500 hover:bg-primary-400 text-white rounded-md";
            break;
        case "slate":
            variantStyles = "bg-slate-800 hover:bg-primary-400 text-white/80 rounded-md";
            break;
        case "danger":
            variantStyles = "bg-red-800 hover:bg-primary-400 text-white/80 rounded-md";
            break;
        case "secondary":
            variantStyles = "bg-primary-200 hover:bg-primary-300/50 text-primary rounded-md";
            break;
        case "outline":
            variantStyles = "bg-white hover:bg-gray-200 border border-stroke text-gray-900 rounded-md";
            break;
        case "disabled":
            variantStyles = "bg-gray-400 border border-gray-500 text-gray-600 rounded-md cursor-not-allowed";
            break;
        case "success":
            variantStyles = "bg-secondary hover:bg-secondary-400 text-white rounded-md";
            break;
        case "sivatheme":
            variantStyles = "bg-green-700 hover:bg-secondary-400 text-white rounded-md";
            break;
        case "sivathemedark":
            variantStyles = "bg-green-800 hover:bg-secondary-400 text-white rounded-md";
            break;
        case "perso":
            variantStyles = " ";
            break;
        case "ico":
            if (iconTheme === "accent") {
                variantStyles = "bg-primary hover:bg-primary-400 text-white rounded-full";
            } else if (iconTheme === "secondary") {
                variantStyles = "bg-primary-200 hover:bg-primary-300/50 text-primary rounded-full";
            } else if (iconTheme === "gray") {
                variantStyles = "bg-gray-800 hover:bg-gray-700 text-white rounded-full";
            }
            break;
    }

    switch (size) {
        case "small":
            sizeStyles = `title-xs font-medium first-letter:uppercase ${
                variant === "ico" ? "flex items-center justify-center" : "px-3 py-1"
            }`;
            icoSize = 18;
            break;
        case "medium":
            sizeStyles = `title-md font-medium ${
                variant === "ico" ? "flex items-center justify-center w-[50px] h-[50px]" : "px-4 py-2"
            }`;
            icoSize = 20;
            break;
        case "large":
            sizeStyles = `title-lg font-medium ${
                variant === "ico" ? "flex items-center justify-center w-[60px] h-[60px]" : "px-[22px] py-[18px]"
            }`;
            icoSize = 24;
            break;
    }

    const handleClick = () => {
        if (action) action();
    };

    const buttonContent = (
        <>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {variant === "accent" || variant === "ico" ? (
                        <Spinner size="small" variant="white" />
                    ) : (
                        <Spinner size="small" variant="white" />
                    )}
                </div>
            )}

            <div className={clsx(isLoading && "invisible")}>
                {variant === "ico" && icon ? (
                    <i className={clsx(icon, `text-${icoSize}`)} />
                ) : (
                    <div className={clsx(icon && "flex items-center gap-1")}>
                        {icon && iconPosition === "left" && <i className={clsx(icon, `text-${icoSize}`)} />}
                        {typeof children === 'string'
                        ? children.charAt(0).toUpperCase() + children.slice(1)
                        : children}
                        {icon && iconPosition === "right" && <i className={clsx(icon, `text-${icoSize}`)} />}
                    </div>
                )}
            </div>
        </>
    );

    const buttonElement = (
        <button
            type={type}
            className={clsx(
                variantStyles,
                sizeStyles,
                isLoading && "cursor-not-allowed",
                fullWidth && "w-full",
                supStyle && `${supStyle}`,
                "relative animate first-letter:uppercase"
            )}
            onClick={handleClick}
            disabled={disabled || isLoading}
            {...rest} // Passe tous les autres attributs au bouton
        >
            {buttonContent}
        </button>
    );

    if (baseUrl) {
        if (linkType === "external") {
            return (
                <a href={baseUrl} target="_blank" rel="noopener noreferrer" {...rest}>
                    {buttonElement}
                </a>
            );
        } else {
            return <a href={baseUrl} {...rest}>{buttonElement}</a>;
        }
    }

    return buttonElement;
};