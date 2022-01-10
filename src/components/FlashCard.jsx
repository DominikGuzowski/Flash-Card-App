import React from "react";

export const FlashCard = () => {
    return (
        <div className='flash-card'>
            <div className='flash-card__content'>
                <div className='flash-card__front'>
                    <h3 className='flash-card__heading'>FRONT HEADING</h3>
                    <p className='flash-card__text'>FRONT CONTENT</p>
                </div>
                <div className='flash-card__back'>
                    <h3 className='flash-card__heading'>BACK HEADING</h3>
                    <p className='flash-card__text'>BACK CONTENT</p>
                </div>
            </div>
        </div>
    );
};
