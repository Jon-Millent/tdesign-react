import React, { useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import { StyledProps } from '../_type';
import injectValue from '../_util/injectValue';
import useConfig from '../_util/useConfig';
import noop from '../_util/noop';
import { PromptFillIcon, SuccessFillIcon, WarningFillIcon, HelpFillIcon, LoadingIcon, CloseIcon } from '../icon';
import { prefix, prefixWrapper, ThemeList, PlacementOffset } from './const';
import { MessageProps, MessageConfig, MessageInstance, MessageRef, MessageComponent } from './MessageProps';

const IconMap = {
  info: PromptFillIcon,
  success: SuccessFillIcon,
  warning: WarningFillIcon,
  error: WarningFillIcon,
  question: HelpFillIcon,
  loading: LoadingIcon,
};

let MessageList: MessageInstance[] = [];
let keyIndex = 1;

const Top = 'top';

const globalConfig = {
  zIndex: 6000,
  duration: 3000,
  top: 32,
};

function createContainer({ attach, zIndex, placement = Top }: MessageConfig) {
  let mountedDom = document.body as HTMLElement;
  if (React.isValidElement(attach)) {
    mountedDom = attach;
  }

  const container = Array.from(mountedDom.querySelectorAll(`.${prefixWrapper}`));
  if (container.length < 1) {
    const div = document.createElement('div');
    div.className = classNames(prefixWrapper);
    div.style.zIndex = String(zIndex);

    Object.keys(PlacementOffset[placement]).forEach((key) => {
      div.style[key] = PlacementOffset[placement][key];
    });

    if (placement.includes(Top)) {
      div.style[Top] = `${globalConfig.top}px`;
    }
    mountedDom.appendChild(div);
    return div;
  }
  return container[0];
}

function renderElement(theme, config: MessageConfig) {
  const container = createContainer(config) as HTMLElement;
  const { content, offset } = config;
  const div = document.createElement('div');

  keyIndex += 1;

  const message = {
    close: () => {
      ReactDOM.unmountComponentAtNode(div);
      div.remove();
    },
    key: keyIndex,
  };

  let style: React.CSSProperties = {};
  if (offset) {
    style = {
      ...offset,
      position: 'absolute',
      width: 'auto',
    };
  }

  return new Promise((res) => {
    ReactDOM.render(
      <Message
        theme={theme}
        style={style}
        ref={() => {
          res(message);
        }}
        key={keyIndex}
        {...config}
        close={() => message.close()}
      >
        {content}
      </Message>,
      div,
    );
    container.appendChild(div);
    MessageList.push(message);
  });
}

function MessageIcon({ theme }: MessageProps) {
  const Icon = IconMap[theme];
  return Icon ? <Icon /> : null;
}

function MessageClose({ closeBtn, onClickCloseBtn }: MessageProps) {
  const { classPrefix } = useConfig();

  if (!closeBtn) {
    return null;
  }

  if (closeBtn === true) {
    return <CloseIcon className={`${prefix}-close`} />;
  }

  const button = injectValue(closeBtn)(onClickCloseBtn);

  if (typeof button === 'string' || typeof button === 'number') {
    return (
      <span className={`${classPrefix}-message-close`} onClick={onClickCloseBtn}>
        {closeBtn}
      </span>
    );
  }

  if (React.isValidElement<StyledProps>(button)) {
    return React.cloneElement(button, {
      className: classNames(button.props.className, `${classPrefix}-message-close`),
    });
  }

  return <CloseIcon className={`${classPrefix}-message-close`} />;
}

const Message: MessageComponent = React.forwardRef((props, ref: MessageRef) => {
  const {
    theme = 'info',
    closeBtn = false,
    duration,
    onDurationEnd = noop,
    onClosed = noop,
    children,
    className,
    style,
    close = noop,
  } = props;

  const { classPrefix } = useConfig();
  const timerRef = useRef(0);

  const startDuration = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      onDurationEnd({ close });
      close();
    }, duration);
  }, [duration, onDurationEnd, close]);

  useEffect(() => {
    if (typeof duration === 'number') {
      startDuration();
    }
    return () => {
      clearTimeout(timerRef.current);
      typeof onClosed === 'function' && onClosed();
    };
  }, [duration, onDurationEnd, onClosed, startDuration]);
  // useImperativeHandle(ref as React.Ref<MessageInstance>, () => ({ close }), [close]);
  return (
    <div
      key="message"
      className={classNames(`${prefix}`, className, `${classPrefix}-is-${theme}`, {
        [`${classPrefix}-is-closable`]: closeBtn,
      })}
      ref={ref}
      style={style}
      onMouseEnter={() => {
        clearTimeout(timerRef.current);
      }}
      onMouseLeave={() => {
        startDuration();
      }}
    >
      <MessageIcon {...props} />
      {children}
      <MessageClose {...props} />
    </div>
  );
});

function isConfig(content: MessageConfig | React.ReactNode): content is MessageConfig {
  return Object.prototype.toString.call(content) === '[object Object]' && !!(content as MessageConfig).content;
}

ThemeList.forEach((theme) => {
  Message[theme] = (content: MessageConfig | React.ReactNode, duration: number = globalConfig.duration) => {
    let config = {} as MessageConfig;
    if (isConfig(content)) {
      config = {
        duration,
        ...content,
      };
    } else {
      config = {
        content,
        duration,
      };
    }
    config = {
      ...config,
      zIndex: config.zIndex || globalConfig.zIndex,
    };
    return renderElement(theme, config);
  };
});

Message.close = (message) => {
  message.then((instance) => instance.close());
};

Message.closeAll = function () {
  MessageList.forEach((message) => {
    typeof message.close === 'function' && message.close();
  });
  MessageList = [];
};

export default Message;
