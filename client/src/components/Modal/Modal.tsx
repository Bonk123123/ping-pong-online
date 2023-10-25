import React, { FC } from 'react';

interface props {
    isOpen: boolean;
    children?: React.ReactNode;
    outerClickFunction?: Function;
}

const Modal: FC<props> = ({ isOpen, children, outerClickFunction }) => {
    const modalRef = React.useRef<HTMLDivElement>(null);

    const handleOuterFunction = (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        if (modalRef.current?.parentNode === e.target && outerClickFunction)
            outerClickFunction();
    };

    if (!isOpen) return <></>;
    return (
        <div
            onClick={(e) => handleOuterFunction(e)}
            className="absolute h-[100vh] w-[100vw] flex justify-center items-center bg-transparent z-50"
        >
            <div
                ref={modalRef}
                className="bg-black p-4 font-pixel border-white border-4 flex justify-center items-center"
            >
                {children}
            </div>
        </div>
    );
};

export default Modal;
