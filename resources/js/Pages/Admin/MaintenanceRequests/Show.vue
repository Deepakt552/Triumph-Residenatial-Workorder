<template>
  <AdminLayout>
    <template #header>
      <h2 class="font-semibold text-xl text-gray-800 leading-tight">
        Maintenance Request Details
      </h2>
    </template>

    <div class="py-12">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div class="p-6 bg-white border-b border-gray-200">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg font-semibold">Tenant: {{ request.tenant_name }}</h3>
              <div class="flex space-x-2">
                <Link
                  :href="route('admin.maintenance-requests')"
                  class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Back to List
                </Link>
              </div>
            </div>

            <!-- Status Badge -->
            <div class="mb-6">
              <span
                :class="{
                  'bg-yellow-100 text-yellow-800': request.status === 'pending',
                  'bg-green-100 text-green-800': request.status === 'approved',
                  'bg-red-100 text-red-800': request.status === 'rejected',
                }"
                class="px-3 py-1 rounded-full text-xs font-medium"
              >
                {{ request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : 'Pending' }}
              </span>
              
              <!-- Language Badge -->
              <span v-if="request.selected_language" class="ml-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ request.selected_language === 'es' ? 'Spanish' : 'English' }}
              </span>
            </div>

            <!-- Request Details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 class="font-medium text-gray-700 mb-2">Tenant Information</h4>
                <div class="bg-gray-50 p-4 rounded-md">
                  <p><span class="font-medium">Name:</span> {{ request.tenant_name }}</p>
                  <p><span class="font-medium">Email:</span> {{ request.tenant_email }}</p>
                  <p><span class="font-medium">Phone:</span> {{ request.tenant_phone }}</p>
                </div>
              </div>

              <div>
                <h4 class="font-medium text-gray-700 mb-2">Property Information</h4>
                <div class="bg-gray-50 p-4 rounded-md">
                  <p><span class="font-medium">Building:</span> {{ request.building_name }}</p>
                  <p><span class="font-medium">Unit:</span> {{ request.unit_number }}</p>
                  <p><span class="font-medium">Scheduled:</span> {{ formatDate(request.scheduled_date) }} at {{ request.scheduled_time }}</p>
                </div>
              </div>
            </div>

            <!-- Work Requested -->
            <div class="mb-6">
              <h4 class="font-medium text-gray-700 mb-2">Work Requested</h4>
              <div class="bg-gray-50 p-4 rounded-md">
                <p>{{ request.work_requested }}</p>
                
                <!-- Original Spanish text if available -->
                <div v-if="request.selected_language === 'es' && request.work_requested_original" class="mt-2 p-2 border-l-4 border-blue-500 bg-blue-50">
                  <p class="text-sm text-gray-600"><span class="font-medium">Original (Spanish):</span> {{ request.work_requested_original }}</p>
                </div>
              </div>
            </div>

            <!-- Special Instructions -->
            <div v-if="request.special_instructions" class="mb-6">
              <h4 class="font-medium text-gray-700 mb-2">Special Instructions</h4>
              <div class="bg-gray-50 p-4 rounded-md">
                <p>{{ request.special_instructions }}</p>
                
                <!-- Original Spanish text if available -->
                <div v-if="request.selected_language === 'es' && request.special_instructions_original" class="mt-2 p-2 border-l-4 border-blue-500 bg-blue-50">
                  <p class="text-sm text-gray-600"><span class="font-medium">Original (Spanish):</span> {{ request.special_instructions_original }}</p>
                </div>
              </div>
            </div>

            <!-- Re-translate Button (only for Spanish submissions) -->
            <div v-if="request.selected_language === 'es'" class="mt-6 mb-6">
              <button 
                @click="retranslateRequest" 
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                :disabled="isProcessing"
              >
                {{ isProcessing ? 'Re-translating...' : 'Re-translate from Spanish' }}
              </button>
              <p class="text-sm text-gray-500 mt-1">
                Use this to improve the translation quality if the current translation is poor.
              </p>
            </div>

            <!-- Action Buttons -->
            <div v-if="request.status === 'pending'" class="mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                @click="showApproveModal = true"
                class="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Approve Request
              </button>
              <button
                @click="showRejectModal = true"
                class="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Reject Request
              </button>
            </div>

            <div v-else class="mt-8">
              <button
                @click="resendPdf"
                class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                :disabled="isResending"
              >
                {{ isResending ? 'Sending...' : 'Resend PDF to Tenant' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Approve Modal -->
    <Modal :show="showApproveModal" @close="showApproveModal = false">
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Approve Maintenance Request</h3>
        <p class="mb-4">Are you sure you want to approve this maintenance request?</p>
        
        <div class="mb-4">
          <label for="approveNotes" class="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea
            id="approveNotes"
            v-model="approveNotes"
            rows="3"
            class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Add any notes for the tenant..."
          ></textarea>
        </div>
        
        <div class="mt-5 sm:mt-6 flex justify-end space-x-3">
          <button
            @click="showApproveModal = false"
            class="bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
          <button
            @click="approveRequest"
            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            :disabled="isProcessing"
          >
            {{ isProcessing ? 'Processing...' : 'Approve' }}
          </button>
        </div>
      </div>
    </Modal>

    <!-- Reject Modal -->
    <Modal :show="showRejectModal" @close="showRejectModal = false">
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Reject Maintenance Request</h3>
        <p class="mb-4">Are you sure you want to reject this maintenance request?</p>
        
        <div class="mb-4">
          <label for="rejectReason" class="block text-sm font-medium text-gray-700 mb-1">Reason for Rejection <span class="text-red-500">*</span></label>
          <textarea
            id="rejectReason"
            v-model="rejectReason"
            rows="3"
            class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Provide a reason for rejection..."
            required
          ></textarea>
        </div>
        
        <div class="mt-5 sm:mt-6 flex justify-end space-x-3">
          <button
            @click="showRejectModal = false"
            class="bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
          <button
            @click="rejectRequest"
            class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            :disabled="isProcessing || !rejectReason"
          >
            {{ isProcessing ? 'Processing...' : 'Reject' }}
          </button>
        </div>
      </div>
    </Modal>
  </AdminLayout>
</template>

<script>
import { ref } from 'vue';
import { useForm } from '@inertiajs/inertia-vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';
import Modal from '@/Components/Modal.vue';
import { Link } from '@inertiajs/inertia-vue3';
import axios from 'axios';

export default {
  components: {
    AdminLayout,
    Modal,
    Link
  },
  
  props: {
    request: Object
  },
  
  setup(props) {
    const showApproveModal = ref(false);
    const showRejectModal = ref(false);
    const approveNotes = ref('');
    const rejectReason = ref('');
    const isProcessing = ref(false);
    const isResending = ref(false);
    
    const approveForm = useForm({
      notes: ''
    });
    
    const rejectForm = useForm({
      reason: ''
    });
    
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    };
    
    const approveRequest = () => {
      isProcessing.value = true;
      approveForm.notes = approveNotes.value;
      
      approveForm.post(route('admin.maintenance-requests.approve', props.request.id), {
        onSuccess: () => {
          showApproveModal.value = false;
          approveNotes.value = '';
          isProcessing.value = false;
        },
        onError: () => {
          isProcessing.value = false;
        }
      });
    };
    
    const rejectRequest = () => {
      if (!rejectReason.value) return;
      
      isProcessing.value = true;
      rejectForm.reason = rejectReason.value;
      
      rejectForm.post(route('admin.maintenance-requests.reject', props.request.id), {
        onSuccess: () => {
          showRejectModal.value = false;
          rejectReason.value = '';
          isProcessing.value = false;
        },
        onError: () => {
          isProcessing.value = false;
        }
      });
    };
    
    const resendPdf = () => {
      isResending.value = true;
      
      axios.post(route('admin.maintenance-requests.resend-pdf', props.request.id))
        .then(response => {
          if (response.data.success) {
            alert('PDF has been resent to the tenant.');
          } else {
            alert('Failed to resend PDF: ' + response.data.message);
          }
        })
        .catch(error => {
          console.error('Error resending PDF:', error);
          alert('An error occurred while resending the PDF.');
        })
        .finally(() => {
          isResending.value = false;
        });
    };
    
    // Method to re-translate the maintenance request
    const retranslateRequest = async () => {
      try {
        isProcessing.value = true;
        const response = await axios.post(route('admin.maintenance-requests.retranslate', props.request.id));
        
        if (response.data.success) {
          window.location.reload();
          alert('Request has been re-translated successfully.');
        } else {
          alert(response.data.message || 'Failed to re-translate request');
        }
      } catch (error) {
        console.error('Error re-translating request:', error);
        alert('An error occurred while re-translating the request');
      } finally {
        isProcessing.value = false;
      }
    };
    
    return {
      showApproveModal,
      showRejectModal,
      approveNotes,
      rejectReason,
      isProcessing,
      isResending,
      formatDate,
      approveRequest,
      rejectRequest,
      resendPdf,
      retranslateRequest
    };
  }
};
</script> 