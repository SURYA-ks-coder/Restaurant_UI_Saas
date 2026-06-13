import { Drawer } from "antd";
import { useEffect, useRef, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import ButtonClick from "./ButtonClick";

export default function DrawerPop({
  open,
  children,
  close = () => {},
  placement = "",
  handleSubmit = () => {},
  updateFun = () => {},
  updateBtn = false,
  header = [],
  footerBtn = [],
  width = 830,
  className = "",
  background = "#f8fafd",
  headerRight,
  saveAndContinue = false,
  buttonClick = () => {},
  buttonClickCancel = () => {},
  resetPage = () => {},
  items = [],
  menu = true,
  btnName = "",
  stepsData = [],
  nextStep = 0,
  // activeBtn = 0,
  style = "",
  contentWrapperStyle = "",
  customCloseIcon,
  initialBtn = true,
  footerSubmitButton = true,
  avatar = false,
  footerData = "",
  action = () => {},
  footer = true,
  headerTitle = true,
  closable,
  bodyPadding,
  customButton,
  size = "",
  footerBtnDisabled = false,
  src,
  headerBackground,
  name,
  footerBackButton = false,
  footerBackButtonName = "",
  customFooter,
  ClickfooterBackButton = () => {},
  headerRightPayrollScreen,
  CustomFooterBtnContent,
  unSavedChange = true,
  loadingButton = false,
  isFooter = true,
  btnIcon = <IoIosArrowForward />,
  isBtnIcon = false,
  saveButtonDataTour = "",
}) {
  const [show, setShow] = useState(open);
  const [loading, setLoading] = useState(loadingButton);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    setLoading(loadingButton);
  });

  const classNames = {
    body: ["my-drawer-body"],
    mask: ["my-drawer-mask"],
    header: ["my-drawer-header"],
    footer: ["my-drawer-footer"],
    content: ["my-drawer-content"],
  };
  const mode = localStorage.getItem("theme") || "light";
  const drawerStyles = {
    mask: {
      background: mode === "dark" ? "rgba(28, 28, 28, 0.85)" : "",
      backdropFilter: mode === "dark" ? "blur(0.5px)" : "",
    },
    body: {
      backgroundColor: mode === "dark" ? "#2A2A2A" : background,
      color: mode === "dark" ? "#ffffff" : undefined,
      padding: `${bodyPadding}`,
    },
    footer: {
      backgroundColor: mode === "dark" && "#2A2A2A",
      color: mode === "dark" ? "#ffffff" : undefined,
      borderTop: mode === "dark" ? "1px solid #434343" : undefined,
    },
    header: {
      backgroundColor: mode === "dark" ? "#2A2A2A" : headerBackground,
      color: mode === "dark" ? "#ffffff" : undefined,
      borderBottom: mode === "dark" ? "1px solid #434343" : undefined,
    },
  };

  const largeDrawerStyles = {
    position: "absolute",
    height: "100%",
    top: 0,
    // left: 0,
    bottom: 0,
    right: 0,
    width: "100%",
    borderRadius: 0,
    borderTopLeftRadius: "0px !important",
    borderBottomLeftRadius: 0,
  };
  useEffect(() => {
    setShow(open);
    window.scrollTo(0, 0);
  }, [open]);

  const handleClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    setShow(false);
    closeTimerRef.current = setTimeout(() => {
      close(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return (
    <Drawer
      size="590px"
      // styles={drawerStyles}
      // classNames={classNames}
      closable={closable}
      closeIcon={
        customCloseIcon ? (
          customCloseIcon
        ) : (
          <IoClose
            style={{
              color: mode === "dark" ? "#ffffff" : "#000000",
              fontSize: 18,
            }}
          />
        )
      }
      styles={{
        wrapper: size === "large" ? largeDrawerStyles : contentWrapperStyle,
        ...drawerStyles,
      }}
      placement={placement ? placement : "right"}
      // placement="left"
      title={
        headerTitle && (
          <div className="flex flex-col justify-between gap-4 pl-4 md:flex-row dark:text-white">
            <div className="relative flex flex-col">
              <h1 className="h1">{header[0]}</h1>
              <p className="para">{header[1]}</p>
            </div>

            <div className="">{headerRightPayrollScreen}</div>
          </div>
        )
      }
      footer={
        isFooter ? (
          <>
            {footer && customFooter ? (
              customFooter
            ) : (
              <div className="flex sm:justify-between gap-1 sm:gap-8 items-center py-[10px]">
                {footerData.length > 0 ? (
                  <div className="flex items-center justify-between w-4/6 m-auto dark:text-white">
                    {footerData.map((item, index) => (
                      <div className="flex flex-col" key={index}>
                        <div className="text-xs">{item}</div>
                        <div className="text-xs font-bold">Value</div>
                      </div>
                    ))}
                  </div>
                ) : null}
                {footerBackButton && nextStep === 0 ? (
                  <ButtonClick
                    BtnType="cancel"
                    buttonName={footerBackButtonName}
                    icon={<IoIosArrowBack />}
                    handleSubmit={() => {
                      ClickfooterBackButton();
                    }}
                  />
                ) : null}
                {footerSubmitButton && nextStep !== 0 ? (
                  <ButtonClick
                    BtnType="cancel"
                    buttonName={t("Previous")}
                    icon={<IoIosArrowBack />}
                    handleSubmit={() => {
                      buttonClickCancel();
                    }}
                  />
                ) : (
                  <div className="">
                    {nextStep !== 0 ? (
                      <p
                        className="para cursor-pointer"
                        onClick={() => {
                          resetPage();
                        }}
                      >
                        {t("Reset_to_default")}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                )}
                {customButton ? (
                  <div className="flex items-center justify-start gap-1 sm:gap-2">
                    {customButton}
                  </div>
                ) : (
                  <div className="flex items-center justify-start gap-1 sm:gap-2">
                    {CustomFooterBtnContent && CustomFooterBtnContent}
                    {initialBtn && footerBtn[0] && (
                      <ButtonClick
                        handleSubmit={() => {
                          handleClose();
                        }}
                        buttonName={footerBtn[0]}
                        BtnType="cancel"
                        icon={<IoClose />}
                        className="sm:pr-8"
                      />
                    )}
                    {saveAndContinue
                      ? initialBtn && (
                          <span data-tour={saveButtonDataTour || undefined}>
                            <ButtonClick
                              disabled={footerBtnDisabled}
                              handleSubmit={() => {
                                buttonClick();
                              }}
                              saveButton={
                                footerBtn[1] === "Save" ? true : false
                              }
                              icon={isBtnIcon ? btnIcon : null}
                              iconPosition={"end"}
                              buttonName={
                                btnName ? (
                                  btnName
                                ) : (
                                  <div className="flex items-center gap-2 ">
                                    <div>{t("Save_And_Continue_button")}</div>
                                    <IoIosArrowForward />
                                  </div>
                                )
                              }
                              type="submit"
                              className="text-xs font-semibold text-white rounded-md sm:px-5 sm:py-2 lg:text-sm"
                              BtnType="primary"
                              loading={loading}
                            />
                          </span>
                        )
                      : footerSubmitButton &&
                        footerBtn[1] && (
                          <span data-tour={saveButtonDataTour || undefined}>
                            <ButtonClick
                              handleSubmit={() => handleSubmit()}
                              updateFun={() => updateFun()}
                              updateBtn={updateBtn}
                              buttonName={footerBtn[1]}
                              BtnType="primary"
                              className={`${
                                footerBtn[2] && "min-w-[9rem]"
                              } sm:px-5 sm:py-2 text-xs font-semibold text-white rounded-md lg:text-sm`}
                              disabled={footerBtnDisabled}
                              loading={loading}
                            />
                          </span>
                        )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : null
      }
      onClose={() => {
        handleClose();
      }}
      open={show}
    >
      {children}
    </Drawer>
  );
}
