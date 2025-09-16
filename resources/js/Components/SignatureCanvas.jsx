import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import PrimaryButton from './PrimaryButton';

const SignaturePad = forwardRef(({ onSave }, ref) => {
    const sigCanvas = useRef({});
    const [isEmpty, setIsEmpty] = useState(true);

    // Expose methods to parent component through ref
    useImperativeHandle(ref, () => ({
        clear: () => {
            sigCanvas.current.clear();
            setIsEmpty(true);
        },
        isEmpty: () => {
            return isEmpty;
        },
        getCanvas: () => {
            return sigCanvas.current.getCanvas();
        },
        toDataURL: (type, quality) => {
            return sigCanvas.current.toDataURL(type, quality);
        }
    }));

    const clear = () => {
        sigCanvas.current.clear();
        setIsEmpty(true);
    };

    // Auto-save signature when drawing ends
    const handleEnd = () => {
        if (!isEmpty && onSave) {
            const dataURL = sigCanvas.current.toDataURL('image/png');
            onSave(dataURL);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <div className="border border-gray-300 rounded-md mb-4">
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{
                        width: 500,
                        height: 200,
                        className: "signature-canvas",
                        style: { 
                            touchAction: 'none',
                            backgroundColor: '#ffffff'
                        }
                    }}
                    dotSize={2}
                    minWidth={1}
                    maxWidth={3}
                    throttle={16}
                    velocityFilterWeight={0.7}
                    onBegin={() => setIsEmpty(false)}
                    onEnd={handleEnd}
                />
            </div>
            <div className="flex space-x-4">
                <PrimaryButton onClick={clear}>
                    Clear
                </PrimaryButton>
            </div>
        </div>
    );
});

export default SignaturePad; 