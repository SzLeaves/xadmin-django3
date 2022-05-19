import React from 'react'
import _ from 'lodash'
import app, { use } from 'xadmin'
import { _t } from 'xadmin-i18n'
import { Button, Modal, Form } from 'antd'
import { SchemaForm } from 'xadmin-form'
import { Model } from 'xadmin-model'
import { C, Icon } from 'xadmin-ui'

const ChildrenModel = props => {
  const [ show, setShow ] = React.useState(false)
  const { parent, model, refFilter, refData, refField, modelProps, children, header, value, onClose, refreshTimeout, ...extProps } = props
  
  const handleCancel = () => {
    setShow(false)
    onClose && onClose()
  }

  const cmodel = _.isString(model) ? app.get('models')[model] : model
  const schema = {
    ...cmodel,
    parent,
    itemActions: [
      ...(cmodel.itemActions || []),
      item => <EditChildrenModelBtn id={item.id} refData={refData} refreshTimeout={refreshTimeout}>{_t('Edit')}</EditChildrenModelBtn>
    ],
    permission: {
      ...cmodel.permission,
      edit: false,
      childEdit: cmodel.permission && cmodel.permission.edit
    },
    ...modelProps
  }
  const initialValues = {
    wheres: { filters: refFilter || { [refField]: parent.id } }
  }

  const action = children && !_.isString(children) && React.isValidElement(children) ?
    React.cloneElement(children, { onClick: () => setShow(true) }) : 
    <Button size="small" key="child-model-action" className="model-list-action" {...extProps} onClick={() => setShow(true)} >{children || cmodel.title || cmodel.name}</Button>

  const ItemsComponent = (cmodel.components && cmodel.components.DataList) || C('Model.DataTable')

  return [
    action,
    show ? (
      <Model schema={schema} 
        modelKey={`${_.isString(model) ? model : model.name}_${parent.id}`} 
        initialValues={initialValues} >
        <Modal key={1}
          visible={show} 
          title={header || cmodel.title || cmodel.name}
          width="80%"
          onCancel={handleCancel}
          onOk={handleCancel}
        >
          <div key="model-list-subnav" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
            <C is="Model.Pagination" />
            <C is="Model.ListSubMenu"><AddChildrenModelBtn {...props} /></C>
          </div>
          <ItemsComponent key="model-list-grid" />
          <div key="model-list-downnav" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '.5rem' }}>
            <C is="Model.ActionBar" />
            <C is="Model.Pagination" />
          </div>
        </Modal>
      </Model>
    ) : null
  ]
}

const AddChildrenModelBtn = props => {
  const [ show, setShow ] = React.useState(false)
  const { model } = use('model')
  const { getItems } = use('model.getItems')
  const { canAdd } = use('model.permission')
  const { refData, refreshTimeout } = props

  const onSuccess = () => {
    if(refreshTimeout) {
      setTimeout(getItems, refreshTimeout)
    } else {
      getItems()
    }
  }

  return canAdd ? [
    <Button key={0} style={{ marginLeft: '.5rem' }} onClick={() => setShow(true)}>{_t('Add {{object}}', { object: model.title })}</Button>,
    <ChildrenFormModel key={1} onSuccess={onSuccess} refData={refData} show={show} onClose={() => setShow(false)} />
  ] : null
}

const EditChildrenModelBtn = props => {
  const [ show, setShow ] = React.useState(false)
  const { model } = use('model')
  const { getItems } = use('model.getItems')
  const { id, refData, refreshTimeout } = props
  const canChildEdit = !!model.permission && !!model.permission.childEdit

  const onSuccess = () => {
    if(refreshTimeout) {
      setTimeout(getItems, refreshTimeout)
    } else {
      getItems()
    }
  }

  return canChildEdit && [
    <Button key={0} size="sm" className="model-list-action" onClick={() => setShow(true)}>{_t('Edit')}</Button>,
    show ? <ChildrenFormModel key={1} onSuccess={onSuccess} id={id} refData={refData} show={show} onClose={() => {
      setShow(false)
    }} /> : null
  ]
}

const ChildrenFormModel = props => {
  const { show, title, onClose, modalProps, onSuccess, refData } = props
  const { model } = use('model')
  const { data, loading, saveItem } = use('model.item', props)

  const onSubmitSuccess = (item) => {
    onClose()
    onSuccess(item)
  }

  const onSaveItem = (values) => {
    saveItem({ ...values, ...refData })
  }

  const FormLayout = (props) => {
    const { children, invalid, handleSubmit, submitting } = props
    return (
      <Modal
        {...modalProps}
        visible={show} width="70%"
        title={title}
        className="xadmin-modal-form"
        onCancel={onClose}
        onOk={handleSubmit}
        okButtonDisabled={invalid || submitting}
        okText={<><Icon name="ban"/> {_t('Save')}</>}
        okButtonProps={{ loading: submitting }}
      >
        <Form>{children}</Form>
      </Modal>
    )
  }

  return show && !loading ? (
    <SchemaForm
      formKey={`model.modalform.${model.key}`}
      schema={model}
      initialValues={{ ...data, ...refData }}
      onSubmit={onSaveItem}
      onClose={onClose}
      component={FormLayout}
      onSubmitSuccess={onSubmitSuccess}
    />
  ) : null

}

export default ChildrenModel
