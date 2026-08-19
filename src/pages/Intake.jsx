import React, { useState } from 'react';
import client from '../api/client';
import { toast } from '../components/Toast';

export default function Intake({ setPage }) {
  const [hmcName, setHmcName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [loading, setLoading] = useState(false);

  const [articles, setArticles] = useState([]);

  const [articleType, setArticleType] = useState('Ring');
  const [metal, setMetal] = useState('Gold');
  const [purity, setPurity] = useState('916 (22K)');
  const [declaredWt, setDeclaredWt] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [priority, setPriority] = useState('Normal');
  const [remarks, setRemarks] = useState('');

  const addArticle = () => {
    if (!declaredWt) {
      return toast('Weight declared by customer is required.', 'error');
    }
    
    setArticles([...articles, {
      type: articleType,
      metal: metal,
      purity: purity,
      gross_weight: parseFloat(declaredWt),
      quantity: parseInt(quantity),
      priority: priority,
      remarks: remarks
    }]);

    setArticleType('Ring');
    setMetal('Gold');
    setPurity('916 (22K)');
    setDeclaredWt('');
    setQuantity(1);
    setPriority('Normal');
    setRemarks('');
  };

  const removeArticle = (index) => {
    setArticles(articles.filter((_, i) => i !== index));
  };

  const editArticle = (index) => {
    const art = articles[index];
    setArticleType(art.type);
    setMetal(art.metal);
    setPurity(art.purity);
    setDeclaredWt(art.gross_weight.toString());
    setQuantity(art.quantity);
    setPriority(art.priority);
    setRemarks(art.remarks || '');
    setArticles(articles.filter((_, i) => i !== index));
  };

  const saveOrder = async (isReceipt = false) => {
    const articlesToSave = [...articles];
    
    if (declaredWt) {
      articlesToSave.push({
        type: articleType,
        metal: metal,
        purity: purity,
        gross_weight: parseFloat(declaredWt),
        quantity: parseInt(quantity),
        priority: priority,
        remarks: remarks
      });
    }

    if (!hmcName || articlesToSave.length === 0) {
      return toast('HallMarking Centre Name and at least one article are required.', 'error');
    }

    setLoading(true);
    try {
      const payload = {
        customer_name: hmcName,
        customer_id: licenseNo,
        customer_mobile: custMobile,
        articles: articlesToSave
      };
      const res = await client.post('/workflow/orders', payload);
      
      if (isReceipt) {
         toast(`Receipt generated! Order ID: ${res.data.order.order_code}`, 'success');
      } else {
         toast(`Order saved! Order ID: ${res.data.order.order_code}`, 'success');
      }
      
      setHmcName('');
      setLicenseNo('');
      setCustMobile('');
      setArticles([]);
      setArticleType('Ring');
      setMetal('Gold');
      setPurity('916 (22K)');
      setDeclaredWt('');
      setQuantity(1);
      setPriority('Normal');
      setRemarks('');
    } catch (err) {
      console.error(err);
      toast('Error saving order: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page active" id="p-intake">
      <div className="page-title"><i className="ti ti-circle-plus"></i> Article Intake</div>
      <div className="card">
        <div className="card-title" style={{ marginBottom: '14px' }}>Jeweller Shop Details</div>
        
        <div className="form-grid">
          <div className="form-group">
            <label>Jeweller Shop Name *</label>
            <input type="text" placeholder="Enter shop name" value={hmcName} onChange={e => setHmcName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>License Number of shop</label>
            <input type="text" placeholder="e.g. LIC-1234" value={licenseNo} onChange={e => setLicenseNo(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Mobile Number</label>
            <input type="tel" placeholder="10-digit mobile" value={custMobile} onChange={e => setCustMobile(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Date of Receipt</label>
            <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
        </div>
        
        <div className="divider"></div>

        {articles.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div className="card-title" style={{ fontSize: '14px', marginBottom: '10px' }}>Added Articles</div>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginBottom: '10px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '8px' }}>Type</th>
                  <th style={{ padding: '8px' }}>Metal</th>
                  <th style={{ padding: '8px' }}>Purity</th>
                  <th style={{ padding: '8px' }}>Weight</th>
                  <th style={{ padding: '8px' }}>Qty</th>
                  <th style={{ padding: '8px' }}>Priority</th>
                  <th style={{ padding: '8px' }}></th>
                </tr>
              </thead>
              <tbody>
                {articles.map((art, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px' }}>{art.type}</td>
                    <td style={{ padding: '8px' }}>{art.metal}</td>
                    <td style={{ padding: '8px' }}>{art.purity}</td>
                    <td style={{ padding: '8px' }}>{art.gross_weight}</td>
                    <td style={{ padding: '8px' }}>{art.quantity}</td>
                    <td style={{ padding: '8px' }}>{art.priority}</td>
                    <td style={{ padding: '8px' }}>
                      <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px', marginRight: '4px' }} onClick={() => editArticle(idx)}>
                        Edit
                      </button>
                      <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => removeArticle(idx)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="card-title" style={{ marginBottom: '14px' }}>Add Article</div>
        
        <div className="form-grid three">
          <div className="form-group">
            <label>Article Type *</label>
            <select value={articleType} onChange={e => setArticleType(e.target.value)}>
              <option>Ring</option><option>Necklace</option>
              <option>Bangle</option><option>Earrings</option><option>Bracelet</option>
              <option>Pendant</option><option>Chain</option><option>Anklet</option><option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Metal *</label>
            <select value={metal} onChange={e => setMetal(e.target.value)}>
              <option>Gold</option>
              <option>Silver</option>
            </select>
          </div>
          <div className="form-group">
            <label>Declared Purity</label>
            <select value={purity} onChange={e => setPurity(e.target.value)}>
              <option>999 (24K)</option>
              <option>916 (22K)</option>
              <option>833 (20K)</option>
              <option>750 (18K)</option>
              <option>666 (16K)</option>
              <option>585 (14K)</option>
              <option>375 (9K)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Weight Declared by customer (g) *</label>
            <input type="number" placeholder="0.000" step="0.001" value={declaredWt} onChange={e => setDeclaredWt(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input type="number" value={quantity} min="1" onChange={e => setQuantity(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)}>
              <option>Normal</option>
              <option>Urgent</option>
              <option>Express</option>
            </select>
          </div>
          <div className="form-group full">
            <label>Special Instructions / Remarks</label>
            <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Stone settings, fragile items, notes..."></textarea>
          </div>
        </div>

        <div style={{ marginTop: '10px', marginBottom: '20px' }}>
          <button className="btn btn-outline" onClick={addArticle}>
            <i className="ti ti-plus"></i> Add another article
          </button>
        </div>
        
        <div className="divider"></div>
        
        <div className="btn-row">
          <button className="btn btn-gold" onClick={() => saveOrder(false)} disabled={loading}>
            <i className="ti ti-check"></i> {loading ? 'Saving...' : 'Save'}
          </button>
          <button className="btn btn-outline" onClick={() => saveOrder(true)} disabled={loading}>
            <i className="ti ti-receipt"></i> Receipt
          </button>
          <button className="btn btn-outline" onClick={() => { if(setPage) setPage('delivery_vouchers'); }}>
            <i className="ti ti-file-invoice"></i> Delivery Voucher
          </button>
        </div>
      </div>
    </div>
  );
}
