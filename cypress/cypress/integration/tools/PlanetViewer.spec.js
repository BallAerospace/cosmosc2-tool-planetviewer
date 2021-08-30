/*
# Copyright 2021 Ball Aerospace & Technologies Corp.
# All Rights Reserved.
#
# This program is free software; you can modify and/or redistribute it
# under the terms of the GNU Affero General Public License
# as published by the Free Software Foundation; version 3 with
# attribution addendums as found in the LICENSE.txt
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# This program may also be used under the terms of a commercial or
# enterprise edition license of COSMOS if purchased from the
# copyright holder
*/

import { format, add } from 'date-fns'

function formatTime(date) {
  return format(date, 'HH:mm:ss')
}
function formatDate(date) {
  return format(date, 'yyyy-MM-dd')
}

describe('PlanetViewer', () => {
  beforeEach(() => {
    cy.visit('/tools/planetviewer')
    cy.hideNav()
    cy.wait(1000)
  })

  afterEach(() => {
    //
  })

  it('check visuals menus', function () {
    cy.wait(4000)
    cy.get('[data-test="Planet Viewer-Cesium"]').click({ force: true })
    cy.wait(100)
    cy.get('[data-test="Planet Viewer-Cesium-View Visuals"]').click({ force: true })
    cy.wait(100)
    cy.get('td').contains('Currently no visuals')
    cy.wait(100)
    cy.get('.footer-text').click({ force: true })
    cy.wait(100)
  })
  
  it('check add static dialog', function () {
    cy.wait(4000)
    cy.get('[data-test="Planet Viewer-Cesium"]').click({ force: true })
    cy.wait(100)
    cy.get('[data-test="Planet Viewer-Cesium-Add Static Visual"]').click({ force: true })
    cy.wait(100)
    cy.get('[data-test=add-static-cancel-btn]').click({ force: true })
    cy.wait(100)
  })

  it('check add static dialog and save config', function () {
    cy.wait(4000)
    cy.get('[data-test="Planet Viewer-Cesium"]').click({ force: true })
    cy.wait(100)
    cy.get('[data-test="Planet Viewer-Cesium-Add Static Visual"]').click({ force: true })
    cy.wait(100)
    cy.get('[data-test="static-visual-name"]').type('New York City')
    cy.wait(100)
    cy.get('[data-test="static-visual-description"]').type('New York City, NY, USA')
    cy.wait(100)
    cy.get('[data-test=latitude-input]').type('40.730610')
    cy.wait(100)
    cy.get('[data-test=longitude-input]').type('-73.935242')
    cy.wait(100)
    cy.get('[data-test=add-static-success-btn]').click({ force: true })
    cy.wait(100)
    cy.get('[data-test="Planet Viewer-Cesium"]').click({ force: true })
    cy.wait(100)
    cy.get('[data-test="Planet Viewer-Config-Save Configuration"]').click({ force: true })
    cy.wait(100)
  })

  it('check reset', function () {
    cy.wait(4000)
    cy.get('[data-test="Planet Viewer-Cesium"]').click({ force: true })
    cy.wait(100)
    cy.get('[data-test="Planet Viewer-Cesium-Reset Viewer"]').click({ force: true })
    cy.wait(4000)
  })

})
