import React, { useState, useEffect } from 'react';
import client from '../api/client';

export default function CreateInvoice({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  
  // Header state
  const [saleType, setSaleType] = useState('Cash');
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [stateOfSupply, setStateOfSupply] = useState('Delhi');

  // Items state
  const [items, setItems] = useState([
    { id: 1, item_name: '', quantity: 1, unit: 'NONE', price_per_unit: 0, is_tax_inclusive: false, discount_pct: 0, discount_amt: 0, tax_rate: 'GST@18%', tax_amt: 0, amount: 0 }
  ]);

  const [paymentStatus, setPaymentStatus] = useState('Paid');
  
  // Additional Features state
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  
  // Totals state
  const [roundOff, setRoundOff] = useState(0);
  const [totals, setTotals] = useState({ subtotal: 0, total_discount: 0, total_tax: 0, grand_total: 0 });

  useEffect(() => {
    // Generate an invoice number
    setInvoiceNumber('INV-' + Math.floor(10000 + Math.random() * 90000));
    
    // Fetch customers
    client.get('/customer')
      .then(res => setCustomers(res.data.data || res.data))
      .catch(err => console.error('Failed to fetch customers', err));
  }, []);

  // Recalculate totals whenever items or roundOff changes
  useEffect(() => {
    let sub = 0;
    let disc = 0;
    let tax = 0;
    
    const calculatedItems = items.map(item => {
      // Calculate row amount
      const baseTotal = item.quantity * item.price_per_unit;
      
      // Discount
      let rowDiscAmt = parseFloat(item.discount_amt) || 0;
      if (parseFloat(item.discount_pct) > 0) {
        rowDiscAmt = baseTotal * (parseFloat(item.discount_pct) / 100);
      }
      
      const afterDiscount = baseTotal - rowDiscAmt;
      
      // Tax
      let rowTaxAmt = 0;
      if (item.tax_rate === 'GST@18%') {
        rowTaxAmt = afterDiscount * 0.18;
      } else if (item.tax_rate === 'GST@3%') {
        rowTaxAmt = afterDiscount * 0.03;
      }
      
      const finalAmount = afterDiscount + rowTaxAmt;
      
      sub += baseTotal;
      disc += rowDiscAmt;
      tax += rowTaxAmt;
      
      return { ...item, discount_amt: rowDiscAmt, tax_amt: rowTaxAmt, amount: finalAmount };
    });
    
    // Avoid infinite loop by not calling setItems here, we just use calculated items for totals
    // Wait, if we want the row amount to display, we need to update items. 
    // To avoid loop, we calculate totals only.
    
    const rawTotal = sub - disc + tax;
    const grand = rawTotal + parseFloat(roundOff || 0);
    
    setTotals({
      subtotal: sub,
      total_discount: disc,
      total_tax: tax,
      grand_total: grand
    });
  }, [items, roundOff]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // Recalculate row
    const item = newItems[index];
    const baseTotal = item.quantity * item.price_per_unit;
    
    let rowDiscAmt = parseFloat(item.discount_amt) || 0;
    if (field === 'discount_pct' && value > 0) {
      rowDiscAmt = baseTotal * (parseFloat(value) / 100);
      item.discount_amt = rowDiscAmt.toFixed(2);
    } else if (field === 'discount_amt') {
      item.discount_pct = 0;
    }
    
    const afterDiscount = baseTotal - rowDiscAmt;
    
    let rowTaxAmt = 0;
    if (item.tax_rate === 'GST@18%') {
      rowTaxAmt = afterDiscount * 0.18;
    } else if (item.tax_rate === 'GST@3%') {
      rowTaxAmt = afterDiscount * 0.03;
    }
    item.tax_amt = rowTaxAmt;
    item.amount = afterDiscount + rowTaxAmt;
    
    setItems(newItems);
  };

  const addRow = () => {
    setItems([...items, { 
      id: Date.now(), item_name: '', quantity: 1, unit: 'NONE', price_per_unit: 0, 
      is_tax_inclusive: false, discount_pct: 0, discount_amt: 0, tax_rate: 'GST@18%', tax_amt: 0, amount: 0 
    }]);
  };

  const removeRow = (index) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const handleCustomerSelect = (e) => {
    const id = e.target.value;
    setCustomerId(id);
    if (id) {
      const cust = customers.find(c => c.id.toString() === id);
      if (cust) {
        setCustomerName(cust.name);
        setCustomerPhone(cust.phone || '');
        setBillingAddress(cust.address || '');
      }
    } else {
      setCustomerName('');
      setCustomerPhone('');
      setBillingAddress('');
    }
  };

  const handleSave = async () => {
    if (!customerName) {
      alert("Please enter customer name");
      return;
    }
    if (items.some(i => !i.item_name)) {
      alert("Please enter item names for all rows");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        sale_type: saleType,
        customer_id: customerId,
        customer_name: customerName,
        customer_phone: customerPhone,
        billing_address: billingAddress,
        shipping_address: shippingAddress,
        state_of_supply: stateOfSupply,
        subtotal: totals.subtotal,
        total_discount: totals.total_discount,
        total_tax: totals.total_tax,
        round_off: roundOff,
        grand_total: totals.grand_total,
        status: paymentStatus, // Use explicit user selection instead of inferring from saleType
        image_url: imageUrl,
        description: description,
        linked_payment: 'Cash', // default since removed
        payment_amount: 0,
        items: items
      };

      await client.post('/billing/invoices', payload);
      alert('Invoice Saved Successfully!');
      if (onBack) onBack();
    } catch (err) {
      console.error(err);
      alert('Error saving invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
      {/* Header Bar */}
      <div style={{ background: '#F8F9FA', padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {onBack && (
            <button className="btn btn-outline btn-sm" onClick={onBack}>
              <i className="ti ti-arrow-left"></i> Back
            </button>
          )}
          <h2 style={{ fontSize: '18px', margin: 0, color: 'var(--text)' }}>Sale</h2>
          <div style={{ display: 'flex', background: '#E9ECEF', borderRadius: '20px', padding: '2px' }}>
            <div 
              style={{ padding: '4px 16px', borderRadius: '18px', fontSize: '12px', cursor: 'pointer', background: saleType === 'Credit' ? '#fff' : 'transparent', boxShadow: saleType === 'Credit' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', color: saleType === 'Credit' ? 'var(--blue)' : '#666' }}
              onClick={() => setSaleType('Credit')}
            >Credit</div>
            <div 
              style={{ padding: '4px 16px', borderRadius: '18px', fontSize: '12px', cursor: 'pointer', background: saleType === 'Cash' ? 'var(--blue)' : 'transparent', boxShadow: saleType === 'Cash' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', color: saleType === 'Cash' ? '#fff' : '#666' }}
              onClick={() => setSaleType('Cash')}
            >Cash</div>
          </div>
          
          <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>
          
          <div style={{ display: 'flex', background: '#E9ECEF', borderRadius: '20px', padding: '2px' }}>
            <div 
              style={{ padding: '4px 16px', borderRadius: '18px', fontSize: '12px', cursor: 'pointer', background: paymentStatus === 'Pending' ? '#fff' : 'transparent', boxShadow: paymentStatus === 'Pending' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', color: paymentStatus === 'Pending' ? 'var(--red)' : '#666' }}
              onClick={() => setPaymentStatus('Pending')}
            >Pending</div>
            <div 
              style={{ padding: '4px 16px', borderRadius: '18px', fontSize: '12px', cursor: 'pointer', background: paymentStatus === 'Paid' ? 'var(--green)' : 'transparent', boxShadow: paymentStatus === 'Paid' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', color: paymentStatus === 'Paid' ? '#fff' : '#666' }}
              onClick={() => setPaymentStatus('Paid')}
            >Paid</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline"><i className="ti ti-settings"></i></button>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Customer & Invoice Details Top */}
        <div style={{ display: 'flex', gap: '40px', marginBottom: '30px' }}>
          {/* Left Side: Customer */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 2 }}>
                <label style={{ color: 'var(--red)' }}>Customer *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select value={customerId} onChange={handleCustomerSelect} style={{ flex: 1 }}>
                    <option value="">-- Select Customer --</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input 
                    type="text" 
                    placeholder="Or type name..." 
                    value={customerName} 
                    onChange={e => { setCustomerName(e.target.value); setCustomerId(''); }} 
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Phone No.</label>
                <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Billing Address</label>
                <textarea rows="2" value={billingAddress} onChange={e => setBillingAddress(e.target.value)}></textarea>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Shipping Address</label>
                <textarea rows="2" value={shippingAddress} onChange={e => setShippingAddress(e.target.value)}></textarea>
              </div>
            </div>
          </div>

          {/* Right Side: Invoice Meta */}
          <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ color: '#666', fontWeight: 500 }}>Invoice Number</label>
              <input type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} style={{ width: '140px', background: '#F8F9FA', border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, textAlign: 'right' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ color: '#666', fontWeight: 500 }}>Invoice Date</label>
              <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} style={{ width: '140px', background: '#F8F9FA', border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, textAlign: 'right' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ color: '#666', fontWeight: 500 }}>State of supply</label>
              <select value={stateOfSupply} onChange={e => setStateOfSupply(e.target.value)} style={{ width: '140px', background: '#F8F9FA', border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, textAlign: 'right' }}>
                <option value="Delhi">Delhi</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Gujarat">Gujarat</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Table */}
        <div style={{ overflowX: 'auto', marginBottom: '20px', border: '1px solid var(--border)', borderRadius: '6px' }}>
          <table style={{ minWidth: '1000px', margin: 0 }}>
            <thead>
              <tr style={{ background: '#F1F3F5' }}>
                <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                <th style={{ width: '250px' }}>ITEM</th>
                <th style={{ width: '80px' }}>QTY</th>
                <th style={{ width: '100px' }}>UNIT</th>
                <th style={{ width: '120px' }}>PRICE/UNIT<br/><small style={{fontWeight: 'normal', color:'#888'}}>Without Tax</small></th>
                <th style={{ width: '160px', textAlign: 'center' }}>DISCOUNT<br/><span style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'normal', color:'#888', fontSize: '10px'}}><span style={{flex:1}}>%</span><span style={{flex:1}}>AMOUNT</span></span></th>
                <th style={{ width: '160px', textAlign: 'center' }}>TAX<br/><span style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'normal', color:'#888', fontSize: '10px'}}><span style={{flex:1}}></span><span style={{flex:1}}>AMOUNT</span></span></th>
                <th style={{ width: '100px', textAlign: 'right' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} style={{ background: '#fff' }}>
                  <td style={{ textAlign: 'center', padding: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#888' }}>{idx + 1}</span>
                      <i className="ti ti-trash" style={{ cursor: 'pointer', color: 'var(--red)', fontSize: '14px' }} onClick={() => removeRow(idx)}></i>
                    </div>
                  </td>
                  <td style={{ padding: '4px' }}>
                    <input type="text" value={item.item_name} onChange={e => handleItemChange(idx, 'item_name', e.target.value)} style={{ border: '1px solid transparent', background: '#F8F9FA' }} placeholder="Enter item name..." />
                  </td>
                  <td style={{ padding: '4px' }}>
                    <input type="number" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', parseFloat(e.target.value)||0)} style={{ border: '1px solid transparent', background: '#F8F9FA' }} />
                  </td>
                  <td style={{ padding: '4px' }}>
                    <select value={item.unit} onChange={e => handleItemChange(idx, 'unit', e.target.value)} style={{ border: '1px solid transparent', background: '#F8F9FA' }}>
                      <option value="NONE">NONE</option>
                      <option value="PCS">PCS</option>
                      <option value="GM">GM</option>
                    </select>
                  </td>
                  <td style={{ padding: '4px' }}>
                    <input type="number" value={item.price_per_unit} onChange={e => handleItemChange(idx, 'price_per_unit', parseFloat(e.target.value)||0)} style={{ border: '1px solid transparent', background: '#F8F9FA' }} />
                  </td>
                  <td style={{ padding: '4px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input type="number" value={item.discount_pct} onChange={e => handleItemChange(idx, 'discount_pct', parseFloat(e.target.value)||0)} style={{ width: '50%', border: '1px solid transparent', background: '#F8F9FA' }} />
                      <input type="number" value={item.discount_amt} onChange={e => handleItemChange(idx, 'discount_amt', parseFloat(e.target.value)||0)} style={{ width: '50%', border: '1px solid transparent', background: '#F8F9FA' }} />
                    </div>
                  </td>
                  <td style={{ padding: '4px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <select value={item.tax_rate} onChange={e => handleItemChange(idx, 'tax_rate', e.target.value)} style={{ width: '60%', border: '1px solid transparent', background: '#F8F9FA', fontSize: '11px' }}>
                        <option value="NONE">Select</option>
                        <option value="GST@18%">GST@18%</option>
                        <option value="GST@3%">GST@3%</option>
                      </select>
                      <input type="text" readOnly value={item.tax_amt ? item.tax_amt.toFixed(2) : '0'} style={{ width: '40%', border: 'none', background: 'transparent', textAlign: 'right', fontSize: '12px' }} />
                    </div>
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>
                    {item.amount ? item.amount.toFixed(2) : '0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '8px 12px', background: '#fff', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-outline btn-sm" onClick={addRow} style={{ color: 'var(--blue)', borderColor: 'var(--blue)' }}>
              ADD ROW
            </button>
            <span style={{ float: 'right', marginRight: '160px', fontWeight: 600, fontSize: '12px' }}>TOTAL QTY: {items.reduce((sum, i) => sum + i.quantity, 0)}</span>
          </div>
        </div>

        {/* Footer Actions & Totals */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          
          <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label style={{ color: '#666', fontWeight: 500 }}>Description / Remarks</label>
              <textarea 
                rows="3" 
                placeholder="Enter invoice remarks, terms, or notes..." 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                style={{ width: '100%', background: '#F8F9FA', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px' }}
              />
            </div>
            
            <div className="form-group">
              <label style={{ color: '#666', fontWeight: 500 }}>Attachment (Image)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  id="invoice-image-upload" 
                  style={{ display: 'none' }} 
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => setImageUrl(e.target.result);
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
                <button 
                  className="btn btn-outline" 
                  onClick={() => document.getElementById('invoice-image-upload').click()}
                  style={{ width: 'fit-content' }}
                >
                  <i className="ti ti-upload"></i> {imageUrl ? 'Change Image' : 'Upload Image'}
                </button>
                {imageUrl && (
                  <div style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img src={imageUrl} alt="Attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div 
                      style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '2px 4px', cursor: 'pointer', fontSize: '10px' }}
                      onClick={() => setImageUrl('')}
                    >
                      <i className="ti ti-x"></i>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div style={{ width: '350px', background: '#F8F9FA', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: '#666' }}>Subtotal</span>
              <span>₹ {totals.subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: '#666' }}>Discount</span>
              <span>- ₹ {totals.total_discount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: '#666' }}>Tax</span>
              <span>+ ₹ {totals.total_tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '13px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
                <input type="checkbox" checked={roundOff !== 0} onChange={e => setRoundOff(e.target.checked ? (Math.round(totals.subtotal - totals.total_discount + totals.total_tax) - (totals.subtotal - totals.total_discount + totals.total_tax)).toFixed(2) : 0)} />
                Round Off
              </label>
              <input type="number" step="0.01" value={roundOff} onChange={e => setRoundOff(e.target.value)} style={{ width: '60px', textAlign: 'right', padding: '2px 4px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px dashed var(--border)', paddingTop: '12px', fontSize: '18px', fontWeight: 700 }}>
              <span>Total</span>
              <span>₹ {totals.grand_total.toFixed(2)}</span>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                Share <i className="ti ti-chevron-down"></i>
              </button>
              <button className="btn btn-blue" style={{ flex: 2, justifyContent: 'center' }} onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
