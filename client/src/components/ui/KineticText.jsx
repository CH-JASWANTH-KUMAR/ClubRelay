import React from 'react';
import { cn } from '@/lib/utils';

/**
 * KineticText: Animated text component that dynamically modulates font weight
 * and stroke width of characters on hover with neighbor influence.
 *
 * Implements the MagicUI @magicui/kinetic-text character-level text-stroke and font-weight
 * animations while wrapping word tokens to prevent mid-word typographic hyphenation/line-breaks.
 */
export function KineticText({
  text,
  as: Tag = 'h1',
  className = '',
  style,
  ...rest
}) {
  const mergedStyle = {
    '--hover-padding': 'calc(1em / 12)',
    '--text-stroke-width': 'calc(1em * 125 / 6000)',
    ...style,
  };

  const words = text.split(' ');

  return (
    <Tag
      {...rest}
      className={cn('inline-flex flex-wrap font-[300]', className)}
      style={mergedStyle}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-flex whitespace-nowrap">
          {word.split('').map((letter, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="[will-change:font-weight,-webkit-text-stroke-width,padding] [-webkit-text-stroke-color:transparent] [-webkit-text-stroke-width:var(--text-stroke-width)] [transition:font-weight_0.4s,_-webkit-text-stroke-color_0.4s,_padding_0.4s] hover:[padding-inline:var(--hover-padding)] hover:font-[900] hover:[-webkit-text-stroke-color:currentcolor] hover:[-webkit-text-stroke-width:calc(var(--text-stroke-width)*2)] has-[+span+span:hover]:font-[400] has-[+span:hover]:[padding-inline:var(--hover-padding)] has-[+span:hover]:font-[600] [:hover+&]:[padding-inline:var(--hover-padding)] [:hover+&]:font-[600] [:hover+span+&]:font-[400]"
            >
              {letter}
            </span>
          ))}
          {wordIndex < words.length - 1 && (
            <span aria-hidden="true" className="inline-block">&nbsp;</span>
          )}
        </span>
      ))}
      <span className="sr-only">{text}</span>
    </Tag>
  );
}

export default KineticText;
