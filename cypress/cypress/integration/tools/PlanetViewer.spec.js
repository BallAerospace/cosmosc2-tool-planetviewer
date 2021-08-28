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

  it('check menus', function () {
    cy.get('.v-item-group > :nth-child(1)').click({ force: true })
    cy.wait(100)
    cy.get('[data-test=PlanetViewer-Current]').click({ force: true })
    cy.wait(1000)
  })

})
