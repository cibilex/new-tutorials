knex: whereExists: whereRaw ile çalışır,where clause ile her zaman undefined verir.s
trx
.from('shipment_template_items as sti')
.select('sti.type', 'sti.primary_price', 'sti.secondary_price', 'sti.country', 'sti.service')
.where('sti.id', req.body.selectedShipment)
.where('sti.status', commonTableStatuses.ACTIVE)
.where(builder =>
builder
.where(b =>
b.where('sti.type', shipmentPriceTypes.CUSTOM_PRICE).whereExists(function () {
this.select('u.id').from('users as u').where('u.id', 'sti.user_id').first()
})
)
.orWhere(b =>
b.where('sti.type', shipmentPriceTypes.BELONGS_TEMPLATE).whereExists(function () {
this.from('shipment_templates as st').select('st.id').whereRaw('st.id = sti.parent_id').first()
})
)
)
.first()