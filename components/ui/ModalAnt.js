"use client";

import { Modal } from "antd";

export default function ModalAnt({
  isVisible = false,
  onClose = () => {},
  onOk,
  centered = true,
  padding = "24px",
  showCancelButton = true,
  showOkButton = true,
  showCloseButton = true,
  width = 520,
  title,
  okText = "OK",
  cancelText = "Cancel",
  maskClosable = true,
  children,
  ...props
}) {
  const hasFooter = showOkButton || showCancelButton;

  return (
    <Modal
      open={isVisible}
      onCancel={onClose}
      onOk={onOk || onClose}
      centered={centered}
      width={width}
      title={title}
      closable={showCloseButton}
      mask={{ closable: maskClosable }}
      footer={hasFooter ? undefined : null}
      okButtonProps={{ style: { display: showOkButton ? undefined : "none" } }}
      cancelButtonProps={{
        style: { display: showCancelButton ? undefined : "none" },
      }}
      okText={okText}
      cancelText={cancelText}
      styles={{ body: { padding } }}
      {...props}
    >
      {children}
    </Modal>
  );
}
