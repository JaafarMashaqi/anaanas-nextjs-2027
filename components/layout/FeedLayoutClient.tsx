'use client'

import type { ReactNode } from 'react'
import { cloneElement, isValidElement, type ReactElement } from 'react'

import {
  BsBell,
  BsChatLeftTextFill,
  BsCheckSquare,
  BsGear,
  BsPencilSquare,
  BsPeople,
  BsSearch,
  BsSlashCircle,
  BsThreeDots,
  BsVolumeUpFill,
} from 'react-icons/bs'
import {
  Col,
  Container,
  Dropdown,
  DropdownDivider,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormControl,
  Offcanvas,
  OffcanvasBody,
  OffcanvasHeader,
  OffcanvasTitle,
  Row,
} from 'react-bootstrap'
import { FaXmark } from 'react-icons/fa6'

import { useLayoutContext } from '@/context/useLayoutContext'
import type { ChildrenType } from '@/types/component'
import Messaging from '@/components/layout/Messaging'
import AuthFooterSocialLinks from '@/components/layout/AuthFooterSocialLinks'
import Link from 'next/link'
import homeGrid from './feedHomeGrid.module.css'

type FeedLayoutClientProps = ChildrenType & {
  sidebar: ReactNode
  locale?: string
  /** Home uses a wider canvas and a dominant center column. */
  layout?: 'default' | 'home'
}

const FeedLayoutClient = ({ children, sidebar, locale, layout = 'default' }: FeedLayoutClientProps) => {
  const { messagingOffcanvas, startOffcanvas } = useLayoutContext()
  const mobileSidebar =
    startOffcanvas.open && isValidElement(sidebar) ? cloneElement(sidebar as ReactElement) : null

  return (
    <>
      <main className={homeGrid.feedMain}>
        <Container className={layout === 'home' ? homeGrid.canvas : undefined}>
          <Row className={layout === 'home' ? homeGrid.row : 'g-md-4'}>
            <Col lg={layout === 'home' ? undefined : 3} className={layout === 'home' ? `ananas-desktop-only ${homeGrid.side}` : 'ananas-desktop-only'}>
              <nav className="navbar navbar-expand-lg mx-0">
                <div className="d-block px-2 px-lg-0 w-100">{sidebar}</div>
              </nav>





              <footer className="auth-footer d-none d-lg-block">
                <Container>
                  <Row className="justify-content-center">
                    <Col sm={10} md={8} lg={6}>
                      <div className="auth-footer-inner">
                        <ul className="auth-footer-links">
                          <li>
                            <Link href={`/${locale}/contact`} >
                              تواصل معنا
                            </Link>
                          </li>

                        </ul>
                        <AuthFooterSocialLinks />
                      </div>
                    </Col>
                  </Row>
                </Container>
              </footer>



            </Col>
            {children}
          </Row>
        </Container>
      </main>
      <Offcanvas
        show={startOffcanvas.open}
        placement="start"
        onHide={startOffcanvas.toggle}
        tabIndex={-1}
        id="offcanvasSideNavbar"
        className="ananas-mobile-only"
      >
        <OffcanvasHeader closeButton />
        <OffcanvasBody className="d-block px-2 px-lg-0">
          <div>{mobileSidebar}</div>
        </OffcanvasBody>
      </Offcanvas>

      <div className="d-none d-سlg-block">
        <a
          onClick={messagingOffcanvas.toggle}
          className="icon-md btn btn-primary position-fixed end-0 bottom-0 me-5 mb-5"
          role="button"
          aria-controls="offcanvasChat">
          <span>
            <BsChatLeftTextFill />
          </span>
        </a>
        <Offcanvas
          show={messagingOffcanvas.open}
          onHide={messagingOffcanvas.toggle}
          placement="end"
          className="offcanvas-end"
          data-bs-scroll="true"
          data-bs-backdrop="false"
          tabIndex={-1}
          id="offcanvasChat">
          <OffcanvasHeader className="d-flex justify-content-between">
            <OffcanvasTitle as="h5">Messaging</OffcanvasTitle>
            <div className="d-flex">
              <a role="button" className="btn btn-secondary-soft-hover py-1 px-2">
                <BsPencilSquare />
              </a>
              <Dropdown>
                <DropdownToggle
                  as="a"
                  className="content-none btn btn-secondary-soft-hover py-1 px-2"
                  id="chatAction"
                  data-bs-toggle="dropdown"
                  aria-expanded="false">
                  <BsThreeDots />
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end" aria-labelledby="chatAction">
                  <li>
                    <DropdownItem href="#">
                      <BsCheckSquare className="fa-fw pe-2" size={23} /> Mark all as read
                    </DropdownItem>
                  </li>
                  <li>
                    <DropdownItem href="#">
                      <BsGear className="fa-fw pe-2" size={23} /> Chat setting{' '}
                    </DropdownItem>
                  </li>
                  <li>
                    <DropdownItem href="#">
                      <BsBell className="fa-fw pe-2" size={23} /> Disable notifications
                    </DropdownItem>
                  </li>
                  <li>
                    <DropdownItem href="#">
                      <BsVolumeUpFill className="fa-fw pe-2" size={23} /> Message sounds
                    </DropdownItem>
                  </li>
                  <li>
                    <DropdownItem href="#">
                      <BsSlashCircle className="fa-fw pe-2" size={23} /> Block setting
                    </DropdownItem>
                  </li>
                  <li>
                    <DropdownDivider />
                  </li>
                  <li>
                    <DropdownItem href="#">
                      <BsPeople className="fa-fw pe-2" size={23} /> Create a group chat
                    </DropdownItem>
                  </li>
                </DropdownMenu>
              </Dropdown>
              <a role="button" className="btn btn-secondary-soft-hover py-1 px-2" onClick={messagingOffcanvas.toggle}>
                <FaXmark />
              </a>
            </div>
          </OffcanvasHeader>
          <div className="offcanvas-body pt-0 custom-scrollbar">
            <form className="rounded position-relative">
              <FormControl className="ps-5 bg-light" type="search" placeholder="Search..." aria-label="Search" />
              <button className="btn bg-transparent px-3 py-0 position-absolute top-50 start-0 translate-middle-y" type="button">
                <BsSearch className="fs-5" />
              </button>
            </form>
            <Messaging />
          </div>
        </Offcanvas>
      </div>
    </>
  )
}

export default FeedLayoutClient


