const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema({
  body: {
    type: String,
    required: true
  },
  header: {
    type: String,
    required: true
  },
  menuHeader: {
    type: String,
    required: true
  },
  visible: {
    type: Boolean,
    required: true
  },
  order: {
    type: Number
  },
  updated: {
    type: Date,
    default: Date.now
  },
  created: {
    type: Date,
    default: Date.now
  }
});
schema.pre("save", beforeSave);
schema.statics.filteredSearch = filteredSearch;
schema.statics.findByReqAndUpdate = findByReqAndUpdate;
function findByReqAndUpdate(req) {
  const id = req.params.id;
  const update = req.body;
  const options = { new: true, runValidators: true };
  update.updated = Date.now();
  console.log("updete");
  return this.findByIdAndUpdate(id, update, options);
}
function filteredSearch(queryParams, filterFields) {
  const findQuery = this.find();
  const countQuery = this.find();
  filterFields.forEach(addFilterToQuery);
  findQuery
    .sort(queryParams.sortDirection + queryParams.sortField)
    .skip(queryParams.itemsPerPage * (queryParams.page - 1))
    .limit(queryParams.itemsPerPage);
  return Promise.all([findQuery.exec(), countQuery.countDocuments().exec()]);
  function addFilterToQuery(filter) {
    const findFilter = {};
    let filterName = filter.name;
    let filterValue = filter.value;
    let dateFilterType;
    const isDateFilter =
      filterName.indexOf("dateFrom_") > -1 ||
      filterName.indexOf("dateTo_") > -1;
    if (isDateFilter) {
      dateFilterType = filterName.split("_")[0];
      filterName = filterName.split("_")[1];
      if (dateFilterType === "dateFrom") {
        filterValue = { $gte: new Date(filter.value) };
      }
      if (dateFilterType === "dateTo") {
        filterValue = { $lt: new Date(filter.value) };
      }
    }
    if (!isDateFilter) {
      if (["header"].indexOf(filterName) > -1) {
        filterValue = new RegExp(filter.value, "i");
      }
    }
    findFilter[filterName] = filterValue;
    findQuery.find(findFilter);
    countQuery.find(findFilter);
  }
}
const model = mongoose.model("content-blocks", schema);
function beforeSave(next) {
  let update = this;
  next();
}
module.exports = model;
